import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_mandi_prices_api():
    response = client.get("/api/mandi/prices?crop=Onion")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    first = data[0]
    assert "crop" in first
    assert "market" in first
    assert "min_price" in first
    assert "max_price" in first
    assert "modal_price" in first
    assert "source" in first
    assert "last_updated" in first

def test_mandi_markets_and_crops_api():
    res_markets = client.get("/api/mandi/markets")
    assert res_markets.status_code == 200
    markets = res_markets.json()
    assert len(markets) > 0
    assert "market" in markets[0]

    res_crops = client.get("/api/mandi/crops")
    assert res_crops.status_code == 200
    crops = res_crops.json()
    assert len(crops) > 0
    assert "name_en" in crops[0]

def test_mandi_history_api():
    response = client.get("/api/mandi/history?crop=Onion&market=Lasalgaon&days=7")
    assert response.status_code == 200
    data = response.json()
    assert data["crop"] == "Onion"
    assert data["market"] == "Lasalgaon"
    assert len(data["history"]) == 7

def test_mandi_market_comparison_api():
    response = client.get("/api/mandi/compare?crop=Onion")
    assert response.status_code == 200
    data = response.json()
    assert data["crop"] == "Onion"
    assert "comparison" in data
    assert len(data["comparison"]) > 0
    assert "disclaimer_en" in data
    assert "disclaimer_mr" in data
    assert "indicative" in data["disclaimer_en"].lower()
