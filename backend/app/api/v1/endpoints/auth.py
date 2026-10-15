from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.auth import OTPRequest, OTPVerify, TokenResponse
from app.models.user import User
from app.auth.otp_service import get_otp_service
from app.core.security import create_access_token

router = APIRouter()

@router.post("/request-otp")
def request_otp(payload: OTPRequest):
    otp_service = get_otp_service()
    success = otp_service.send_otp(payload.phone)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to dispatch OTP"
        )
    return {
        "message": "OTP sent successfully",
        "phone": payload.phone,
        "dev_hint": "Use OTP 123456 in dev mode"
    }

@router.post("/verify-otp", response_model=TokenResponse)
def verify_otp(payload: OTPVerify, db: Session = Depends(get_db)):
    otp_service = get_otp_service()
    valid = otp_service.verify_otp(payload.phone, payload.otp)
    if not valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP code"
        )
    
    # Retrieve or create user
    user = db.query(User).filter(User.phone == payload.phone).first()
    is_new_user = False
    if not user:
        user = User(
            phone=payload.phone,
            name="Farmer",
            language="mr",
            voice_enabled=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        is_new_user = True

    token = create_access_token(subject=user.id)
    return {
        "access_token": token,
        "token_type": "bearer",
        "is_new_user": is_new_user,
        "phone": user.phone
    }
