from pydantic import BaseModel, Field
from typing import Optional

class OTPRequest(BaseModel):
    phone: str = Field(..., json_schema_extra={"example": "+919876543210"})

class OTPVerify(BaseModel):
    phone: str = Field(..., json_schema_extra={"example": "+919876543210"})
    otp: str = Field(..., json_schema_extra={"example": "123456"})

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    is_new_user: bool = False
    phone: str
