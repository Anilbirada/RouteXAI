def test_admin_endpoints(client):
    admin_token = client.post("/api/auth/login", json={"email": "admin@routex.ai", "password": "Admin@123"}).json()["access_token"]
    headers = {"Authorization": f"Bearer {admin_token}"}

    # Get users
    users_res = client.get("/api/admin/users", headers=headers)
    assert users_res.status_code == 200
    assert len(users_res.json()) >= 3

    # Get data sources
    sources_res = client.get("/api/admin/data-sources", headers=headers)
    assert sources_res.status_code == 200
    assert len(sources_res.json()) >= 2

    # Get audit logs
    audit_res = client.get("/api/admin/audit-logs", headers=headers)
    assert audit_res.status_code == 200
    assert len(audit_res.json()) >= 1

    # Reset demo data
    reset_res = client.post("/api/admin/reset-demo-data", headers=headers)
    assert reset_res.status_code == 200
    assert "refreshed successfully" in reset_res.json()["message"]

def test_admin_endpoints_unauthorized_for_commuter(client):
    commuter_token = client.post("/api/auth/login", json={"email": "commuter@routex.ai", "password": "Commuter@123"}).json()["access_token"]
    headers = {"Authorization": f"Bearer {commuter_token}"}

    res = client.get("/api/admin/users", headers=headers)
    assert res.status_code == 403
