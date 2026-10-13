def test_login_success(client):
    res = client.post("/api/auth/login", json={"email": "admin@routex.ai", "password": "Admin@123"})
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["user"]["email"] == "admin@routex.ai"
    assert data["user"]["role"] == "admin"

def test_login_invalid_password(client):
    res = client.post("/api/auth/login", json={"email": "admin@routex.ai", "password": "WrongPassword"})
    assert res.status_code == 401
    assert "Incorrect email or password" in res.json()["detail"]

def test_register_and_me(client):
    res = client.post("/api/auth/register", json={
        "name": "New Driver",
        "email": "driver@routex.ai",
        "password": "Password123"
    })
    assert res.status_code == 200
    token = res.json()["access_token"]
    assert res.json()["user"]["role"] == "registered"

    # Call /api/auth/me with bearer token
    me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["email"] == "driver@routex.ai"
