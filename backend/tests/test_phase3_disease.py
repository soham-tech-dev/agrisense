import cv2
import numpy as np
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def get_auth_token():
    client.post("/api/v1/auth/request-otp", json={"phone": "+919876543210"})
    res = client.post("/api/v1/auth/verify-otp", json={"phone": "+919876543210", "otp": "123456"})
    return res.json()["access_token"]



def generate_valid_leaf_image_bytes() -> bytes:
    """Generates a sharp, clear synthetic leaf image (300x300 BGR)"""
    img = np.zeros((300, 300, 3), dtype=np.uint8)
    # Green background leaf texture
    img[:, :, 1] = 180  # Green
    img[:, :, 0] = 30   # Blue
    img[:, :, 2] = 40   # Red
    # Draw leaf veins and brown spots for sharp edges and contrast
    cv2.line(img, (150, 0), (150, 300), (20, 100, 20), 4)
    cv2.line(img, (150, 100), (50, 200), (20, 100, 20), 3)
    cv2.line(img, (150, 150), (250, 250), (20, 100, 20), 3)
    # Add dark spot with concentric pattern
    cv2.circle(img, (100, 100), 25, (10, 20, 120), -1)
    cv2.circle(img, (100, 100), 12, (5, 10, 60), -1)
    
    _, buffer = cv2.imencode('.jpg', img)
    return buffer.tobytes()

def generate_blurry_image_bytes() -> bytes:
    """Generates an extremely blurry image with low Laplacian variance"""
    img = np.full((300, 300, 3), 120, dtype=np.uint8)
    # Heavily blur
    blurry = cv2.GaussianBlur(img, (51, 51), 0)
    _, buffer = cv2.imencode('.jpg', blurry)
    return buffer.tobytes()

def generate_dark_image_bytes() -> bytes:
    """Generates a severely dark image (mean brightness < threshold)"""
    img = np.full((300, 300, 3), 5, dtype=np.uint8)
    _, buffer = cv2.imencode('.jpg', img)
    return buffer.tobytes()


def test_disease_catalog_api():
    response = client.get("/api/v1/disease/catalog")
    assert response.status_code == 200
    catalog = response.json()
    assert len(catalog) >= 3
    first = catalog[0]
    assert "name_en" in first
    assert "name_mr" in first
    assert "symptoms_en" in first
    assert "advisory_en" in first


def test_valid_image_prediction():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    img_bytes = generate_valid_leaf_image_bytes()

    files = {"file": ("leaf.jpg", img_bytes, "image/jpeg")}
    response = client.post("/api/v1/disease/predict", headers=headers, files=files)
    assert response.status_code == 200
    data = response.json()

    assert "scan_id" in data
    assert "prediction" in data
    assert "confidence" in data
    assert "model_version" in data
    assert "disease_info" in data
    assert data["confidence"] > 0.0
    assert data["image_url"].startswith("/static/scans/")


def test_invalid_image_format():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    text_bytes = b"Hello, this is a plain text file, not an image."

    files = {"file": ("document.txt", text_bytes, "text/plain")}
    response = client.post("/api/v1/disease/predict", headers=headers, files=files)
    assert response.status_code == 400
    data = response.json()
    assert data["detail"] == "Please take a clear photo of the affected leaf."


def test_large_image_upload():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    # 11MB dummy payload exceeds 10MB limit
    large_bytes = b"x" * (11 * 1024 * 1024)

    files = {"file": ("huge.jpg", large_bytes, "image/jpeg")}
    response = client.post("/api/v1/disease/predict", headers=headers, files=files)
    assert response.status_code == 400
    data = response.json()
    assert data["detail"] == "Please take a clear photo of the affected leaf."


def test_small_corrupted_image():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    tiny_corrupted_bytes = b"\xFF\xD8\xFF\xE0corrupted_bytes_only"

    files = {"file": ("corrupt.jpg", tiny_corrupted_bytes, "image/jpeg")}
    response = client.post("/api/v1/disease/predict", headers=headers, files=files)
    assert response.status_code == 400
    data = response.json()
    assert data["detail"] == "Please take a clear photo of the affected leaf."


def test_blurry_and_dark_image_rejection():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    # Blurry image
    blurry_bytes = generate_blurry_image_bytes()
    files_blur = {"file": ("blurry.jpg", blurry_bytes, "image/jpeg")}
    res_blur = client.post("/api/v1/disease/predict", headers=headers, files=files_blur)
    assert res_blur.status_code == 400
    assert res_blur.json()["detail"] == "Please take a clear photo of the affected leaf."

    # Dark image
    dark_bytes = generate_dark_image_bytes()
    files_dark = {"file": ("dark.jpg", dark_bytes, "image/jpeg")}
    res_dark = client.post("/api/v1/disease/predict", headers=headers, files=files_dark)
    assert res_dark.status_code == 400
    assert res_dark.json()["detail"] == "Please take a clear photo of the affected leaf."


def test_high_confidence_prediction():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    img_bytes = generate_valid_leaf_image_bytes()

    files = {"file": ("leaf_high.jpg", img_bytes, "image/jpeg")}
    response = client.post("/api/v1/disease/predict", headers=headers, files=files)
    assert response.status_code == 200
    data = response.json()
    assert data["is_low_confidence"] is False
    assert data["warning"] is None


def test_low_confidence_warning():
    # Test low confidence threshold warning behavior via ML service directly and API threshold
    from app.services.disease_ml_service import DiseaseMLService
    ml_service = DiseaseMLService(confidence_threshold=0.99) # Set high threshold to trigger low confidence
    img_bytes = generate_valid_leaf_image_bytes()
    res = ml_service.predict(img_bytes=img_bytes)

    assert res["is_low_confidence"] is True
    assert "The image is not clear enough for a reliable identification" in res["warning"]


def test_api_failure_handling():
    # Request without Authorization header
    img_bytes = generate_valid_leaf_image_bytes()
    files = {"file": ("leaf.jpg", img_bytes, "image/jpeg")}
    response = client.post("/api/v1/disease/predict", files=files)
    assert response.status_code == 401


def test_database_persistence_and_history():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    img_bytes = generate_valid_leaf_image_bytes()

    # 1. Predict and save scan
    files = {"file": ("leaf_history.jpg", img_bytes, "image/jpeg")}
    predict_res = client.post("/api/v1/disease/predict", headers=headers, files=files)
    assert predict_res.status_code == 200
    scan_id = predict_res.json()["scan_id"]

    # 2. Get history list
    history_res = client.get("/api/v1/disease/history", headers=headers)
    assert history_res.status_code == 200
    history = history_res.json()
    assert len(history) > 0
    assert any(item["id"] == scan_id for item in history)

    # 3. Get scan by ID
    get_by_id_res = client.get(f"/api/v1/disease/{scan_id}", headers=headers)
    assert get_by_id_res.status_code == 200
    scan_detail = get_by_id_res.json()
    assert scan_detail["id"] == scan_id
    assert scan_detail["image_url"].startswith("/static/scans/")


def test_scan_feedback():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    img_bytes = generate_valid_leaf_image_bytes()

    files = {"file": ("leaf_feedback.jpg", img_bytes, "image/jpeg")}
    predict_res = client.post("/api/v1/disease/predict", headers=headers, files=files)
    scan_id = predict_res.json()["scan_id"]

    feedback_payload = {
        "is_accurate": True,
        "feedback_text": "Accurate prediction! The advisory was very helpful."
    }
    fb_res = client.post(f"/api/v1/disease/{scan_id}/feedback", headers=headers, json=feedback_payload)
    assert fb_res.status_code == 200
    fb_data = fb_res.json()
    assert fb_data["feedback_accurate"] is True
    assert "Thank you" in fb_data["message"]
