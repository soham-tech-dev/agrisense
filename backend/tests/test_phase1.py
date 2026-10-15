import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["app"] == "AgriSense"
    assert data["phase"] == 1

def test_auth_request_otp():
    response = client.post("/api/v1/auth/request-otp", json={"phone": "+919876543210"})
    assert response.status_code == 200
    data = response.json()
    assert "OTP sent successfully" in data["message"]

def test_auth_verify_otp_and_flow():
    # 1. Verify OTP and obtain JWT token
    verify_res = client.post("/api/v1/auth/verify-otp", json={
        "phone": "+919876543210",
        "otp": "123456"
    })
    assert verify_res.status_code == 200
    token_data = verify_res.json()
    token = token_data["access_token"]
    assert token is not None
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # 2. Get User Profile
    profile_res = client.get("/api/v1/users/me", headers=headers)
    assert profile_res.status_code == 200
    user_data = profile_res.json()
    assert user_data["phone"] == "+919876543210"
    
    # 3. Update User Profile
    update_res = client.put("/api/v1/users/me", headers=headers, json={
        "name": "Ramesh Patil",
        "village": "Niphad",
        "taluka": "Niphad",
        "district": "Nashik",
        "language": "mr",
        "voice_enabled": True
    })
    assert update_res.status_code == 200
    updated_user = update_res.json()
    assert updated_user["name"] == "Ramesh Patil"
    assert updated_user["district"] == "Nashik"

    # 4. Create Farm Details
    farm_res = client.post("/api/v1/farms/me", headers=headers, json={
        "land_size": 2.5,
        "ownership_type": "owned",
        "location": "Niphad Farm, Nashik"
    })
    assert farm_res.status_code == 200
    farm_data = farm_res.json()
    assert farm_data["land_size"] == 2.5
    assert farm_data["ownership_type"] == "owned"

    # 5. Fetch Master Crops
    master_crops_res = client.get("/api/v1/crops")
    assert master_crops_res.status_code == 200
    crops_list = master_crops_res.json()
    assert len(crops_list) > 0
    crop_id = crops_list[0]["id"]

    # 6. Add Crop to Farmer Profile
    add_crop_res = client.post("/api/v1/crops/me", headers=headers, json={
        "crop_id": crop_id,
        "season": "Kharif",
        "acres_allocated": 1.5
    })
    assert add_crop_res.status_code == 200
    user_crop_data = add_crop_res.json()
    assert user_crop_data["season"] == "Kharif"
    assert user_crop_data["acres_allocated"] == 1.5
