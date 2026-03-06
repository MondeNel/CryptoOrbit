def test_register_success(client):
    res = client.post("/auth/register", json={
        "username": "alice", "email": "alice@example.com", "password": "secret"
    })
    assert res.status_code == 201
    assert "access_token" in res.json()

def test_register_duplicate_username(client):
    payload = {"username": "bob", "email": "bob@example.com", "password": "secret"}
    client.post("/auth/register", json=payload)
    res = client.post("/auth/register", json={**payload, "email": "bob2@example.com"})
    assert res.status_code == 400

def test_register_duplicate_email(client):
    client.post("/auth/register", json={"username": "c1", "email": "dup@example.com", "password": "x"})
    res = client.post("/auth/register", json={"username": "c2", "email": "dup@example.com", "password": "x"})
    assert res.status_code == 400

def test_register_seeds_welcome_bonus(client, db):
    client.post("/auth/register", json={"username": "newbie", "email": "n@n.com", "password": "x"})
    from app.models.user import User
    user = db.query(User).filter(User.username == "newbie").first()
    assert user.current_balance == 10.0
    assert user.account_balance == 10.0

def test_login_success(client, registered_user):
    res = client.post("/auth/login", json={"username": "testuser", "password": "password123"})
    assert res.status_code == 200
    assert "access_token" in res.json()

def test_login_wrong_password(client, registered_user):
    res = client.post("/auth/login", json={"username": "testuser", "password": "wrong"})
    assert res.status_code == 401

def test_login_unknown_user(client):
    res = client.post("/auth/login", json={"username": "ghost", "password": "x"})
    assert res.status_code == 401

def test_refresh(client, registered_user):
    res = client.post("/auth/refresh", json={"refresh_token": registered_user["refresh_token"]})
    assert res.status_code == 200
    assert "access_token" in res.json()

def test_refresh_with_access_token_fails(client, registered_user):
    res = client.post("/auth/refresh", json={"refresh_token": registered_user["access_token"]})
    assert res.status_code == 401

def test_me(client, registered_user, auth_headers):
    res = client.get("/auth/me", headers=auth_headers)
    assert res.status_code == 200
    assert res.json()["username"] == "testuser"

def test_me_no_token(client):
    res = client.get("/auth/me")
    assert res.status_code == 403

def test_logout(client):
    res = client.post("/auth/logout")
    assert res.status_code == 204

def test_login_streak_increments(client, db):
    from datetime import date, timedelta
    from app.models.user import User

    client.post("/auth/register", json={"username": "streak", "email": "s@s.com", "password": "x"})
    user = db.query(User).filter(User.username == "streak").first()

    # simulate last login was yesterday
    yesterday = (date.today() - timedelta(days=1)).isoformat()
    user.last_login_date = yesterday
    user.login_streak = 3
    db.commit()

    client.post("/auth/login", json={"username": "streak", "password": "x"})
    db.refresh(user)
    assert user.login_streak == 4

def test_login_streak_resets_after_gap(client, db):
    from app.models.user import User

    client.post("/auth/register", json={"username": "gap", "email": "g@g.com", "password": "x"})
    user = db.query(User).filter(User.username == "gap").first()
    user.last_login_date = "2020-01-01"
    user.login_streak = 10
    db.commit()

    client.post("/auth/login", json={"username": "gap", "password": "x"})
    db.refresh(user)
    assert user.login_streak == 1