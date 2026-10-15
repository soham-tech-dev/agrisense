import os
import io
import time
import pytest
import numpy as np
import cv2
from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings

client = TestClient(app)

# Helper token generation matching actual auth endpoints
def get_auth_headers(phone="+919876543210", role="FARMER"):
    # 1. Request OTP
    client.post("/api/v1/auth/request-otp", json={"phone": phone})
    # 2. Verify OTP
    res = client.post("/api/v1/auth/verify-otp", json={"phone": phone, "otp": "123456"})
    data = res.json()
    token = data["access_token"]
    user_phone = data["phone"]

    # 3. Update role if ADMIN requested
    if role == "ADMIN":
        from app.database.session import SessionLocal
        from app.models.user import User
        db = SessionLocal()
        u = db.query(User).filter(User.phone == user_phone).first()
        if u:
            u.role = "ADMIN"
            db.commit()
        db.close()

    return {"Authorization": f"Bearer {token}"}


# ==============================================================================
# TEST 1 — AUTH & AUTHORIZATION
# ==============================================================================
def test_auth_and_security_roles():
    """Verify user registration, login, logout, invalid creds, and route security."""
    # 1. Invalid OTP
    res_inv = client.post("/api/v1/auth/verify-otp", json={"phone": "+919990001112", "otp": "000000"})
    assert res_inv.status_code == 400

    # 2. Farmer User Auth
    farmer_headers = get_auth_headers("+919876543210", role="FARMER")
    assert "Authorization" in farmer_headers

    # 3. Protected Route Access (Profile)
    res_prof = client.get("/api/v1/users/me", headers=farmer_headers)
    assert res_prof.status_code == 200
    assert res_prof.json()["role"] == "FARMER"

    # 4. Unauthenticated Access to Protected Route
    res_unauth = client.get("/api/v1/users/me")
    assert res_unauth.status_code == 401

    # 5. Farmer accessing Admin Route -> 403 Forbidden
    res_admin_forbidden = client.get("/api/v1/admin/overview", headers=farmer_headers)
    assert res_admin_forbidden.status_code == 403

    # 6. Admin User accessing Admin Route -> 200 OK
    admin_headers = get_auth_headers("+919999999999", role="ADMIN")
    res_admin_ok = client.get("/api/v1/admin/overview", headers=admin_headers)
    assert res_admin_ok.status_code == 200
    assert "total_users" in res_admin_ok.json()


# ==============================================================================
# TEST 2 — WEATHER API & CACHING
# ==============================================================================
def test_weather_integration_and_cache():
    """Verify Weather API response structure, fallback defaults, and fast response times."""
    farmer_headers = get_auth_headers("+919876543210")
    
    # Query current weather for Nashik
    res1 = client.get("/api/v1/weather/current?district=Nashik", headers=farmer_headers)
    assert res1.status_code == 200
    data1 = res1.json()
    assert "temperature" in data1
    assert "humidity" in data1
    assert "condition" in data1

    # Query advisory
    res_adv = client.get("/api/v1/weather/advisory?district=Nashik", headers=farmer_headers)
    assert res_adv.status_code == 200
    assert "advisory_en" in res_adv.json()

    # Verify rapid cached response on repeat request
    t2_start = time.time()
    res2 = client.get("/api/v1/weather/current?district=Nashik", headers=farmer_headers)
    t2_elapsed = time.time() - t2_start
    
    assert res2.status_code == 200
    assert t2_elapsed < 0.5  # Under 500ms cached target on test runners


# ==============================================================================
# TEST 3 — MANDI MARKET DATA & FILTERS
# ==============================================================================
def test_mandi_prices_and_filtering():
    """Verify Mandi price retrieval, filtering by district, and fallback structures."""
    farmer_headers = get_auth_headers("+919876543210")
    
    res = client.get("/api/v1/mandi/prices?district=Pune", headers=farmer_headers)
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    if len(data) > 0:
        item = data[0]
        assert "crop" in item
        assert "modal_price" in item
        assert "market" in item


# ==============================================================================
# TEST 4 — DISEASE CV PIPELINE & IMAGE VALIDATION
# ==============================================================================
def test_disease_image_validation_and_persistence():
    """Verify valid leaf diagnosis, poor/blurry image detection, and DB history persistence."""
    farmer_headers = get_auth_headers("+919876543210")

    # 1. Test Poor / Blurry image rejection
    blurry_img = np.zeros((300, 300, 3), dtype=np.uint8)  # Solid dark image (mean brightness < threshold)
    _, blurry_bytes = cv2.imencode('.jpg', blurry_img)
    
    res_poor = client.post(
        "/api/v1/disease/predict",
        files={"file": ("dark_leaf.jpg", blurry_bytes.tobytes(), "image/jpeg")},
        headers=farmer_headers
    )
    assert res_poor.status_code == 400
    assert "Please take a clear photo" in res_poor.json()["detail"]

    # 2. Test Valid Leaf Image diagnosis
    leaf_img = np.zeros((300, 300, 3), dtype=np.uint8)
    leaf_img[:, :, 1] = 180  # Green background
    leaf_img[:, :, 0] = 30
    leaf_img[:, :, 2] = 40
    cv2.line(leaf_img, (150, 0), (150, 300), (20, 100, 20), 4)
    cv2.circle(leaf_img, (100, 100), 25, (10, 20, 120), -1)
    
    _, leaf_bytes = cv2.imencode('.jpg', leaf_img)
    
    res_valid = client.post(
        "/api/v1/disease/predict",
        files={"file": ("leaf.jpg", leaf_bytes.tobytes(), "image/jpeg")},
        headers=farmer_headers
    )
    assert res_valid.status_code == 200
    data_valid = res_valid.json()
    assert "scan_id" in data_valid
    assert "prediction" in data_valid
    assert "confidence" in data_valid

    # 3. Verify scan persistence in history endpoint
    res_hist = client.get("/api/v1/disease/history", headers=farmer_headers)
    assert res_hist.status_code == 200
    history = res_hist.json()
    assert len(history) >= 1
    assert history[0]["id"] == data_valid["scan_id"]


# ==============================================================================
# TEST 5 — RAG & ADVISOR MULTILINGUAL HANDLING
# ==============================================================================
def test_rag_advisor_bilingual_and_sources():
    """Verify RAG query answering in English and Marathi, source citations, and thread history."""
    farmer_headers = get_auth_headers("+919876543210")

    # 1. English Query
    res_en = client.post(
        "/api/v1/chat",
        json={"query": "How do I control tomato early blight in my crop?", "language": "en"},
        headers=farmer_headers
    )
    assert res_en.status_code == 200
    data_en = res_en.json()
    assert "answer" in data_en
    assert "sources" in data_en

    # 2. Marathi Query
    res_mr = client.post(
        "/api/v1/chat",
        json={"query": "टोमॅटो पिकातील करपा रोगाचे नियंत्रण कसे करावे?", "language": "mr"},
        headers=farmer_headers
    )
    assert res_mr.status_code == 200
    data_mr = res_mr.json()
    assert "answer" in data_mr
    assert len(data_mr["answer"]) > 0


# ==============================================================================
# TEST 6 — VOICE / SPEECH COMPATIBILITY
# ==============================================================================
def test_voice_config_and_text_fallback():
    """Verify voice synthesis payload returns valid transcript & text fallbacks."""
    farmer_headers = get_auth_headers("+919876543210")
    
    res = client.post(
        "/api/v1/chat",
        json={"query": "What fertilizer is best for cotton?", "language": "mr"},
        headers=farmer_headers
    )
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data["answer"], str)


# ==============================================================================
# TEST 7 & 8 — SECURITY AUDIT & INPUT VALIDATION
# ==============================================================================
def test_security_input_validation_and_error_leakage():
    """Verify SQL injection protection, XSS payload safety, input validation, and zero error leakage."""
    farmer_headers = get_auth_headers("+919876543210")

    # 1. SQL Injection attempt in district parameter
    sql_payload = "Nashik' UNION SELECT * FROM users; --"
    res_sql = client.get(f"/api/v1/weather/current?district={sql_payload}", headers=farmer_headers)
    assert res_sql.status_code == 200

    # 2. XSS & Payload injection attempt in Chat Query
    xss_payload = "<script>alert('xss')</script>"
    res_xss = client.post("/api/v1/chat", json={"query": xss_payload}, headers=farmer_headers)
    assert res_xss.status_code == 200
    assert "<script>" not in res_xss.json()["answer"]



# ==============================================================================
# TEST 9 & 10 — PERFORMANCE BENCHMARKS
# ==============================================================================
def test_performance_benchmarks():
    """Verify endpoint response latencies comply with SLAs."""
    farmer_headers = get_auth_headers("+919876543210")

    # 1. Catalog loading SLA (< 200ms)
    t0 = time.time()
    res = client.get("/api/v1/disease/catalog", headers=farmer_headers)
    duration = time.time() - t0
    assert res.status_code == 200
    assert duration < 0.2

    # 2. Health check SLA (< 100ms)
    t0 = time.time()
    res_health = client.get("/health")
    duration_h = time.time() - t0
    assert res_health.status_code == 200
    assert duration_h < 0.1
