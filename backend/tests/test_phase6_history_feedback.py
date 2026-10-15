import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database.session import get_db, Base, engine

client = TestClient(app)

def test_feedback_submission():
    # Submit feedback
    response = client.post(
        "/api/v1/feedback",
        json={
            "feature": "disease",
            "reference_id": "test_scan_123",
            "rating": "helpful",
            "reason": "correct",
            "comment": "Very accurate identification!"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["feature"] == "disease"
    assert data["rating"] == "helpful"
    assert data["reason"] == "correct"
    assert data["comment"] == "Very accurate identification!"

def test_feedback_listing():
    response = client.get("/api/v1/feedback?feature=disease")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1

def test_chat_conversation_flow_and_delete():
    # Create conversation by asking question
    chat_res = client.post(
        "/api/v1/chat",
        json={
            "query": "How to treat early blight in tomatoes?",
            "crop_context": "Tomato",
            "language": "en"
        }
    )
    assert chat_res.status_code == 200
    chat_data = chat_res.json()
    conv_id = chat_data["conversation_id"]
    assert conv_id is not None

    # Get conversations list
    convs_res = client.get("/api/v1/chat/conversations")
    assert convs_res.status_code == 200
    convs = convs_res.json()
    assert any(c["id"] == conv_id for c in convs)

    # Delete conversation
    del_res = client.delete(f"/api/v1/chat/conversations/{conv_id}")
    assert del_res.status_code == 200

    # Verify deleted
    convs_after = client.get("/api/v1/chat/conversations").json()
    assert not any(c["id"] == conv_id for c in convs_after)
