import pytest

def test_deposit(client, auth_headers):
    res = client.post("/wallet/deposit?amount=100", headers=auth_headers)
    assert res.status_code == 201
    assert res.json()["amount"] == 100.0

def test_deposit_updates_balance(client, auth_headers, db):
    from app.models.user import User
    client.post("/wallet/deposit?amount=200", headers=auth_headers)
    user = db.query(User).filter(User.username == "testuser").first()
    assert user.current_balance == 210.0   # 10 welcome + 200

def test_deposit_below_minimum(client, auth_headers):
    res = client.post("/wallet/deposit?amount=5", headers=auth_headers)
    assert res.status_code == 400

def test_deposit_above_maximum(client, auth_headers):
    res = client.post("/wallet/deposit?amount=99999", headers=auth_headers)
    assert res.status_code == 400

def test_withdraw(client, auth_headers):
    client.post("/wallet/deposit?amount=100", headers=auth_headers)
    res = client.post("/wallet/withdraw?amount=50", headers=auth_headers)
    assert res.status_code == 201
    assert res.json()["amount"] == -50.0

def test_withdraw_updates_balance(client, auth_headers, db):
    from app.models.user import User
    client.post("/wallet/deposit?amount=100", headers=auth_headers)
    client.post("/wallet/withdraw?amount=60", headers=auth_headers)
    user = db.query(User).filter(User.username == "testuser").first()
    assert user.current_balance == 50.0   # 10 + 100 - 60

def test_withdraw_insufficient(client, auth_headers):
    res = client.post("/wallet/withdraw?amount=9999", headers=auth_headers)
    assert res.status_code == 400

def test_withdraw_below_minimum(client, auth_headers):
    res = client.post("/wallet/withdraw?amount=5", headers=auth_headers)
    assert res.status_code == 400

def test_transactions_ordered_newest_first(client, auth_headers):
    client.post("/wallet/deposit?amount=100", headers=auth_headers)
    client.post("/wallet/deposit?amount=200", headers=auth_headers)
    res = client.get("/wallet/transactions", headers=auth_headers)
    amounts = [t["amount"] for t in res.json()]
    # welcome bonus is oldest, deposits newest — newest first
    assert amounts[0] == 200.0

def test_transactions_user_isolation(client, auth_headers):
    client.post("/wallet/deposit?amount=100", headers=auth_headers)
    # second user
    client.post("/auth/register", json={"username": "other", "email": "o@o.com", "password": "x"})
    login = client.post("/auth/login", json={"username": "other", "password": "x"})
    other = {"Authorization": f"Bearer {login.json()['access_token']}"}
    res = client.get("/wallet/transactions", headers=other)
    # other user only has their welcome bonus transaction
    assert all(t["type"] == "free" for t in res.json())

def test_no_auth_rejected(client):
    res = client.get("/wallet/transactions")
    assert res.status_code == 403