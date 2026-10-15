from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.auth.jwt import get_current_user
from app.models.user import User
from app.models.farm import Farm
from app.schemas.farm import FarmOut, FarmCreate, FarmUpdate

router = APIRouter()

@router.get("/me", response_model=List[FarmOut])
def get_user_farms(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    farms = db.query(Farm).filter(Farm.user_id == current_user.id).all()
    return farms

@router.post("/me", response_model=FarmOut)
def create_user_farm(
    payload: FarmCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    farm = Farm(
        user_id=current_user.id,
        land_size=payload.land_size,
        ownership_type=payload.ownership_type,
        location=payload.location
    )
    db.add(farm)
    db.commit()
    db.refresh(farm)
    return farm

@router.put("/me/{farm_id}", response_model=FarmOut)
def update_user_farm(
    farm_id: str,
    payload: FarmUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    farm = db.query(Farm).filter(Farm.id == farm_id, Farm.user_id == current_user.id).first()
    if not farm:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Farm not found")
    
    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(farm, key, value)
        
    db.add(farm)
    db.commit()
    db.refresh(farm)
    return farm
