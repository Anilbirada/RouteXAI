def test_get_incidents(client):
    res = client.get("/api/incidents")
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 5
    assert all("id" in item and "title" in item for item in data)

def test_create_incident_valid(client):
    payload = {
        "title": "Minor Fender Bender",
        "incident_type": "accident",
        "description": "Two vehicles brushed bumper on 100ft road. No injuries.",
        "location_name": "100ft Road Indiranagar",
        "latitude": 12.9716,
        "longitude": 77.6412,
        "severity": "low"
    }
    res = client.post("/api/incidents", json=payload)
    assert res.status_code == 201
    data = res.json()
    assert data["title"] == payload["title"]
    assert data["status"] == "reported"  # Unverified initially
    assert len(data["history"]) >= 1

def test_create_incident_invalid_coordinates(client):
    payload = {
        "title": "Invalid Coordinate Incident",
        "incident_type": "hazard",
        "description": "Testing coordinate boundaries",
        "location_name": "Somewhere Invalid",
        "latitude": 195.0,  # Invalid lat (> 90)
        "longitude": 77.6
    }
    res = client.post("/api/incidents", json=payload)
    assert res.status_code == 422

def test_create_incident_invalid_type(client):
    payload = {
        "title": "Invalid Type Incident",
        "incident_type": "alien_invasion",
        "description": "Unregistered incident type",
        "location_name": "Somewhere",
        "latitude": 12.9,
        "longitude": 77.5
    }
    res = client.post("/api/incidents", json=payload)
    assert res.status_code == 422

def test_update_status_rbac(client):
    # Get commuter login
    commuter_token = client.post("/api/auth/login", json={"email": "commuter@routex.ai", "password": "Commuter@123"}).json()["access_token"]
    # Get moderator login
    mod_token = client.post("/api/auth/login", json={"email": "moderator@routex.ai", "password": "Moderator@123"}).json()["access_token"]

    # First get an incident
    inc_id = client.get("/api/incidents").json()[0]["id"]

    # Commuter attempts to change status -> 403 Forbidden
    res_commuter = client.patch(
        f"/api/incidents/{inc_id}/status",
        json={"status": "confirmed", "change_reason": "Commuter self-verification attempt"},
        headers={"Authorization": f"Bearer {commuter_token}"}
    )
    assert res_commuter.status_code == 403

    # Moderator changes status -> 200 OK
    res_mod = client.patch(
        f"/api/incidents/{inc_id}/status",
        json={"status": "confirmed", "change_reason": "Moderator verified via surveillance camera check"},
        headers={"Authorization": f"Bearer {mod_token}"}
    )
    assert res_mod.status_code == 200
    assert res_mod.json()["status"] == "confirmed"

    # Check history contains update
    hist_res = client.get(f"/api/incidents/{inc_id}/history")
    assert hist_res.status_code == 200
    assert len(hist_res.json()) >= 2
