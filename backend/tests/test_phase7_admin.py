import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database.session import get_db, Base, engine
from app.models.user import User
from app.core.security import create_access_token

client = TestClient(app)

@pytest.fixture
def db_session():
    connection = engine.connect()
    transaction = connection.begin()
    db = get_db()
    try:
        yield next(db)
    finally:
        transaction.rollback()
        connection.close()

def test_farmer_denied_admin_access():
    db = next(get_db())
    farmer = db.query(User).filter(User.phone == "9999900001").first()
    if not farmer:
        farmer = User(phone="9999900001", name="Farmer User", role="FARMER")
        db.add(farmer)
        db.commit()
        db.refresh(farmer)
    else:
        farmer.role = "FARMER"
        db.commit()

    token = create_access_token(farmer.id)
    headers = {"Authorization": f"Bearer {token}"}

    # Attempt admin endpoint access
    response = client.get("/api/v1/admin/overview", headers=headers)
    assert response.status_code == 403
    assert "Admin authorization required" in response.json()["detail"]

def test_admin_allowed_access_and_endpoints():
    db = next(get_db())
    admin_user = db.query(User).filter(User.phone == "9999999999").first()
    if not admin_user:
        admin_user = User(phone="9999999999", name="System Admin", role="ADMIN")
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
    else:
        admin_user.role = "ADMIN"
        db.commit()


    token = create_access_token(admin_user.id)
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Overview
    overview_res = client.get("/api/v1/admin/overview", headers=headers)
    assert overview_res.status_code == 200
    assert "total_users" in overview_res.json()

    # 2. Users list
    users_res = client.get("/api/v1/admin/users", headers=headers)
    assert users_res.status_code == 200
    assert isinstance(users_res.json(), list)

    # 3. Model analytics
    model_res = client.get("/api/v1/admin/model", headers=headers)
    assert model_res.status_code == 200
    assert "accuracy" in model_res.json()

    # 4. System analytics
    analytics_res = client.get("/api/v1/admin/analytics", headers=headers)
    assert analytics_res.status_code == 200
    assert "most_searched_crops" in analytics_res.json()

    import uuid
    disease_id = f"test_disease_{uuid.uuid4().hex[:6]}"
    new_disease = client.post(
        "/api/v1/admin/disease",
        json={
            "id": disease_id,
            "crop": "Tomato",
            "name_en": "Tomato Spot",
            "name_mr": "टोमॅटो स्पॉट",
            "symptoms_en": "Small spots",
            "symptoms_mr": "बारीक डाग",
            "advisory_en": "Spray fungicides",
            "advisory_mr": "फवारणी करा",
            "source": "KVK Pune",
            "active": True
        },
        headers=headers
    )
    assert new_disease.status_code == 201
    assert new_disease.json()["name_en"] == "Tomato Spot"

    # Toggle status
    status_res = client.patch(
        f"/api/v1/admin/disease/{disease_id}/status?active=false",
        headers=headers
    )
    assert status_res.status_code == 200
    assert status_res.json()["active"] is False

