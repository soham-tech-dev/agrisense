from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.auth.jwt import get_current_user
from app.models.user import User
from app.schemas.user import UserOut, UserUpdate

router = APIRouter()

@router.get("/me", response_model=UserOut)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=UserOut)
def update_current_user_profile(
    payload: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(current_user, key, value)
    
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user
