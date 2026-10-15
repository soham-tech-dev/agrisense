import json
import pytest
from unittest.mock import patch
from fastapi.testclient import TestClient
from app.main import app
from app.services.intent_detector import intent_detector_service
from app.services.rag_advisor import (
    rag_advisor_service,
    FALLBACK_MESSAGE_EN,
    FALLBACK_MESSAGE_MR,
    RESPONSE_STATE_ANSWERED_WITH_SOURCES,
    RESPONSE_STATE_SAFETY_REVIEW_REQUIRED,
    RESPONSE_STATE_INSUFFICIENT_EVIDENCE
)

client = TestClient(app)

def test_language_detection():
    assert intent_detector_service.detect_language("कांद्यावर पिवळे ठिपके पडले आहेत") == "mr"
    assert intent_detector_service.detect_language("What is the irrigation interval for tomato?") == "en"

def test_intent_detection():
    assert intent_detector_service.detect_intent("My crop has spots and rot") == "DISEASE"
    assert intent_detector_service.detect_intent("Will it rain today in Nashik?") == "WEATHER"
    assert intent_detector_service.detect_intent("Should I irrigate today?") == "IRRIGATION"
    assert intent_detector_service.detect_intent("What is today's onion market price?") == "MANDI"
    assert intent_detector_service.detect_intent("How can I improve soil health?") == "SOIL_NUTRITION"
    assert intent_detector_service.detect_intent("Tomatoes are very bright red what should I do") == "CROP_CARE"
    assert intent_detector_service.detect_intent("How to fix my motor vehicle?") == "UNKNOWN"

def test_rag_query_grounded_response():
    response = client.post("/api/chat", json={
        "query": "How to manage purple blotch in onion?",
        "crop_context": "Onion"
    })
    assert response.status_code == 200
    data = response.json()
    assert "conversation_id" in data
    assert "answer" in data
    assert data["grounded"] is True
    assert len(data["sources"]) > 0

def test_reproducible_example_tomato_bright_red():
    """
    Test Reproducible Example A:
    'Tomatoes are very bright red what should I do'
    Must NOT trigger UNKNOWN safety fallback.
    Must return grounded=True, intent=CROP_CARE, and ICAR tomato harvesting advisory.
    """
    response = client.post("/api/chat", json={
        "query": "Tomatoes are very bright red what should I do",
        "crop_context": "Tomato"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["grounded"] is True
    assert data["intent"] == "CROP_CARE"
    assert data["response_state"] == RESPONSE_STATE_ANSWERED_WITH_SOURCES
    assert len(data["sources"]) >= 1
    # Check that answer provides practical harvest guidance and mentions physiological maturity/ripe stage
    answer_lower = data["answer"].lower()
    assert any(w in answer_lower for w in ["harvest", "ripe", "mature", "morning", "crates"])
    assert data.get("trace_id") is not None

def test_reproducible_example_should_irrigate_today():
    """
    Test Reproducible Example B:
    'should I irrigate today'
    Must NOT trigger UNKNOWN safety fallback.
    Must return grounded=True, intent=IRRIGATION, weather information, and KVK irrigation protocol.
    """
    response = client.post("/api/chat", json={
        "query": "should I irrigate today",
        "district": "Nashik"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["grounded"] is True
    assert data["intent"] == "IRRIGATION"
    assert len(data["sources"]) >= 1
    answer_text = data["answer"]
    assert "Weather" in answer_text or "हवामान" in answer_text
    assert any(term in answer_text for term in ["Moisture", "Finger", "Irrigate", "ओलावा", "सिंचन"])

def test_irrigation_with_rain_forecast_postpones():
    """
    Verifies that when high rainfall is predicted in weather service,
    the advisor advises postponing irrigation today.
    """
    mock_weather = {
        "temperature": 25.0,
        "feels_like": 26.0,
        "condition": "Heavy Rain",
        "humidity": 92,
        "wind_speed": 18.0,
        "rain_probability": 85,
        "district": "Pune",
        "location_name": "Pune",
        "last_updated": "2026-10-14 06:00:00",
        "cached": False
    }
    with patch("app.services.rag_advisor.weather_service.get_current_weather", return_value=mock_weather):
        res = rag_advisor_service.answer_query(
            query="should I irrigate today",
            user_language="en",
            farm_district="Pune"
        )
        assert res["grounded"] is True
        assert "Postpone Irrigation" in res["answer"]
        assert "85%" in res["answer"]

def test_soil_health_query():
    """
    Tests soil nutrition and fertility query routing.
    """
    response = client.post("/api/chat", json={
        "query": "How can I improve soil health?"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["grounded"] is True
    assert data["intent"] == "SOIL_NUTRITION"
    assert len(data["sources"]) >= 1

def test_pesticide_safety_query():
    """
    Tests pesticide safety and CIBRC advisory retrieval.
    """
    response = client.post("/api/chat", json={
        "query": "What precautions should I take before using a pesticide?"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["grounded"] is True
    assert any("pesticide" in s["title"].lower() or "safety" in s["title"].lower() for s in data["sources"])

def test_hallucination_fallback_safety():
    """
    Completely off-topic non-agricultural queries should be politely redirected.
    """
    response = client.post("/api/chat", json={
        "query": "How to repair a smartphone screen using fertilizer?"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["grounded"] is False
    assert data["response_state"] == RESPONSE_STATE_SAFETY_REVIEW_REQUIRED
    assert "AgriSense" in data["answer"] or "कृषी" in data["answer"]

def test_marathi_query_and_fallback():
    response = client.post("/api/chat", json={
        "query": "कांद्यावरील रोगावर काय उपाय करावा?"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["language"] == "mr"
    assert data["grounded"] is True
    assert "answer" in data

def test_admin_knowledge_apis():
    # 1. List docs
    res_list = client.get("/api/admin/knowledge")
    assert res_list.status_code == 200
    initial_count = len(res_list.json())

    # 2. Add doc
    res_create = client.post("/api/admin/knowledge", data={
        "title": "KVK Test Pest Guide",
        "organization": "KVK Test",
        "crop": "Sugarcane",
        "topic": "Pest",
        "language": "en",
        "raw_content": "Sugarcane stem borer can be managed by biological control using Trichogramma chilonis parasitation @ 50,000 per hectare."
    })
    assert res_create.status_code == 201
    created_doc = res_create.json()
    assert created_doc["chunk_count"] >= 1

    # 3. Delete doc
    res_del = client.delete(f"/api/admin/knowledge/{created_doc['id']}")
    assert res_del.status_code == 200
