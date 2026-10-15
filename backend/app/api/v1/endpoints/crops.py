from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.auth.jwt import get_current_user
from app.models.user import User
from app.models.crop import Crop
from app.models.user_crop import UserCrop
from app.schemas.crop import CropOut, UserCropCreate, UserCropOut

router = APIRouter()

DEFAULT_CROPS = [
    {"name_en": "Tomato", "name_mr": "टोमॅटो", "category": "Vegetable"},
    {"name_en": "Onion", "name_mr": "कांदा", "category": "Vegetable"},
    {"name_en": "Cotton", "name_mr": "कापूस", "category": "Commercial"},
    {"name_en": "Sugarcane", "name_mr": "ऊस", "category": "Commercial"},
    {"name_en": "Soybean", "name_mr": "सोयाबीन", "category": "Oilseed"},
    {"name_en": "Wheat", "name_mr": "गहू", "category": "Cereal"},
    {"name_en": "Gram / Chickpea", "name_mr": "हरभरा", "category": "Pulse"},
    {"name_en": "Pomegranate", "name_mr": "डाळिंब", "category": "Fruit"},
    {"name_en": "Grapes", "name_mr": "द्राक्षे", "category": "Fruit"}
]

@router.get("", response_model=List[CropOut])
def get_master_crops(db: Session = Depends(get_db)):
    crops = db.query(Crop).filter(Crop.is_active == True).all()
    if not crops:
        # Seed default crop catalog
        for item in DEFAULT_CROPS:
            crop_obj = Crop(**item)
            db.add(crop_obj)
        db.commit()
        crops = db.query(Crop).filter(Crop.is_active == True).all()
    return crops

@router.get("/me", response_model=List[UserCropOut])
def get_farmer_crops(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_crops = db.query(UserCrop).filter(UserCrop.user_id == current_user.id).all()
    return user_crops

@router.post("/me", response_model=UserCropOut)
def add_crop_to_farmer(
    payload: UserCropCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    crop = db.query(Crop).filter(Crop.id == payload.crop_id).first()
    if not crop:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Crop not found")
        
    user_crop = UserCrop(
        user_id=current_user.id,
        crop_id=payload.crop_id,
        season=payload.season,
        acres_allocated=payload.acres_allocated
    )
    db.add(user_crop)
    db.commit()
    db.refresh(user_crop)
    return user_crop

@router.delete("/me/{user_crop_id}")
def remove_crop_from_farmer(
    user_crop_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_crop = db.query(UserCrop).filter(
        UserCrop.id == user_crop_id,
        UserCrop.user_id == current_user.id
    ).first()
    if not user_crop:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User crop record not found")
        
    db.delete(user_crop)
    db.commit()
    return {"message": "Crop removed successfully"}
