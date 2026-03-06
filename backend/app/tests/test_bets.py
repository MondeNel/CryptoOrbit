import pytest

@pytest.fixture
def funded_headers(client, auth_headers):
    # give the user some extra balance
    client.post("/wallet/deposit?amount=500", headers=auth_headers)
    return auth_headers

def place(client, headers, stake=50, symbol="BTC/USD", direction="up", price=60000.0):
    return client.post("/bets/place", json={
        "symbol": symbol, "direction": direction,
        "stake": stake, "entry_price": price,
    }, headers=headers)

def resolve(client, headers, bet_id, rounds="win,win,lose", exit_price=61000.0):
    return client.post("/bets/resolve", json={
        "bet_id": bet_id, "exit_price": exit_price, "round_results": rounds,
    }, headers=headers)


def test_place_bet(client, funded_headers):
    res = place(client, funded_headers)
    assert res.status_code == 201
    assert res.json()["won"] is None

def test_place_deducts_balance(client, funded_headers, db):
    from app.models.user import User
    place(client, funded_headers, stake=100)
    user = db.query(User).filter(User.username == "testuser").first()
    assert user.current_balance == 460.0   # 510 - 50 welcome already, then -100... recalc
    # exact: welcome=10, deposit=500 → 510. place 100 → 410
    # welcome=10 already, deposit 500 = 510, place 100 = 410
    assert user.current_balance == 410.0

def test_place_insufficient_balance(client, auth_headers):
    res = place(client, auth_headers, stake=9999)
    assert res.status_code == 400

def test_place_stake_below_minimum(client, funded_headers):
    res = place(client, funded_headers, stake=5)
    assert res.status_code == 400

def test_resolve_win(client, funded_headers, db):
    from app.models.user import User
    bet_id = place(client, funded_headers, stake=100).json()["id"]
    res = resolve(client, funded_headers, bet_id, rounds="win,win,lose")
    assert res.status_code == 200
    data = res.json()
    assert data["won"] is True
    assert data["payout"] == round(100 * 1.85, 2)

def test_resolve_loss(client, funded_headers, db):
    bet_id = place(client, funded_headers, stake=100).json()["id"]
    res = resolve(client, funded_headers, bet_id, rounds="lose,lose,win")
    assert res.status_code == 200
    assert res.json()["won"] is False
    assert res.json()["payout"] == 0.0

def test_resolve_updates_xp(client, funded_headers, db):
    from app.models.user import User
    bet_id = place(client, funded_headers).json()["id"]
    resolve(client, funded_headers, bet_id, rounds="win,win,lose")
    user = db.query(User).filter(User.username == "testuser").first()
    assert user.xp > 0

def test_resolve_updates_streak(client, funded_headers, db):
    from app.models.user import User
    bet_id = place(client, funded_headers).json()["id"]
    resolve(client, funded_headers, bet_id, rounds="win,win,lose")
    user = db.query(User).filter(User.username == "testuser").first()
    assert user.streak == 1
    assert user.best_streak == 1

def test_resolve_loss_resets_streak(client, funded_headers, db):
    from app.models.user import User
    # first win
    b1 = place(client, funded_headers).json()["id"]
    resolve(client, funded_headers, b1, rounds="win,win,lose")
    # then loss
    b2 = place(client, funded_headers).json()["id"]
    resolve(client, funded_headers, b2, rounds="lose,lose,win")
    user = db.query(User).filter(User.username == "testuser").first()
    assert user.streak == 0
    assert user.best_streak == 1

def test_resolve_already_resolved(client, funded_headers):
    bet_id = place(client, funded_headers).json()["id"]
    resolve(client, funded_headers, bet_id)
    res = resolve(client, funded_headers, bet_id)
    assert res.status_code == 400

def test_resolve_wrong_user(client, funded_headers):
    bet_id = place(client, funded_headers).json()["id"]
    # register a second user and try to resolve
    client.post("/auth/register", json={"username": "hacker", "email": "h@h.com", "password": "x"})
    login = client.post("/auth/login", json={"username": "hacker", "password": "x"})
    other_headers = {"Authorization": f"Bearer {login.json()['access_token']}"}
    res = resolve(client, other_headers, bet_id)
    assert res.status_code == 404

def test_bet_history(client, funded_headers):
    bet_id = place(client, funded_headers).json()["id"]
    resolve(client, funded_headers, bet_id)
    res = client.get("/bets/history", headers=funded_headers)
    assert res.status_code == 200
    assert len(res.json()) == 1