def test_analytics_summary(client):
    res = client.get("/api/analytics/summary")
    assert res.status_code == 200
    data = res.json()
    assert data["total_records"] >= 5
    assert data["active_incidents"] >= 1
    assert len(data["by_type"]) > 0
    assert len(data["by_severity"]) > 0
    assert len(data["trends_7d"]) == 7
    assert len(data["hotspots"]) > 0
    assert len(data["insights"]) > 0
    assert "ai_summary" in data
    assert "data_disclaimer" in data

def test_analytics_export_csv(client):
    res = client.get("/api/analytics/export?format=csv")
    assert res.status_code == 200
    assert "text/csv" in res.headers["content-type"]
    assert "ID,Title,Type" in res.text

def test_analytics_export_json(client):
    res = client.get("/api/analytics/export?format=json")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) >= 5
