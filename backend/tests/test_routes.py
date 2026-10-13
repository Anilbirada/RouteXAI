def test_compare_routes(client):
    req_body = {
        "origin": {"lat": 12.9081, "lng": 77.5658, "name": "Dayananda Sagar College"},
        "destination": {"lat": 12.9172, "lng": 77.6228, "name": "Silk Board Junction"},
        "preference": "fastest"
    }
    res = client.post("/api/routes/compare", json=req_body)
    assert res.status_code == 200
    data = res.json()
    assert "routes" in data
    assert len(data["routes"]) >= 2
    r_a = data["routes"][0]
    assert r_a["distance_km"] > 0
    assert r_a["duration_minutes"] > 0
    assert len(r_a["coordinates"]) > 0
    assert "notice" in data

def test_save_and_get_routes(client):
    commuter_token = client.post("/api/auth/login", json={"email": "commuter@routex.ai", "password": "Commuter@123"}).json()["access_token"]
    headers = {"Authorization": f"Bearer {commuter_token}"}

    payload = {
        "origin_name": "DSCE Main Campus",
        "destination_name": "Silk Board",
        "origin_lat": 12.9081,
        "origin_lng": 77.5658,
        "dest_lat": 12.9172,
        "dest_lng": 77.6228,
        "distance_km": 6.8,
        "duration_minutes": 22.5,
        "route_data": "[]"
    }
    create_res = client.post("/api/routes/saved", json=payload, headers=headers)
    assert create_res.status_code == 201
    route_id = create_res.json()["id"]

    get_res = client.get("/api/routes/saved", headers=headers)
    assert get_res.status_code == 200
    assert any(r["id"] == route_id for r in get_res.json())

    # Delete
    del_res = client.delete(f"/api/routes/saved/{route_id}", headers=headers)
    assert del_res.status_code == 204
