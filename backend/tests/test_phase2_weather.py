import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.cache_service import cache_service

client = TestClient(app)

def test_weather_current_api():
    response = client.get("/api/weather/current?district=Nashik")
    assert response.status_code == 200
    data = response.json()
    assert "temperature" in data
    assert "feels_like" in data
    assert "condition" in data
    assert "humidity" in data
    assert "wind_speed" in data
    assert "rain_probability" in data
    assert data["district"] == "Nashik"
    assert "last_updated" in data

def test_weather_forecast_api():
    response = client.get("/api/weather/forecast?district=Pune")
    assert response.status_code == 200
    data = response.json()
    assert data["district"] == "Pune"
    assert "forecast" in data
    assert len(data["forecast"]) >= 5
    first = data["forecast"][0]
    assert "day" in first
    assert "temp_max" in first
    assert "temp_min" in first
    assert "rain_probability" in first

def test_weather_advisory_api():
    response = client.get("/api/weather/advisory?district=Solapur")
    assert response.status_code == 200
    data = response.json()
    assert "advisory_en" in data
    assert "advisory_mr" in data
    assert "category" in data
    assert "disclaimer_en" in data
    assert "disclaimer_mr" in data
    assert "Farming Guidance" in data["disclaimer_en"]

def test_weather_cache_fallback():
    # Verify cached flag behavior
    cache_service.clear()
    res1 = client.get("/api/weather/current?district=Nashik").json()
    assert "last_updated" in res1
