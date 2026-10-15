from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    name: Optional[str] = None
    phone: str
    email: Optional[str] = None
    village: Optional[str] = None
    taluka: Optional[str] = None
    district: Optional[str] = None
    language: str = "mr"
    role: str = "FARMER"
    voice_enabled: bool = True


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    village: Optional[str] = None
    taluka: Optional[str] = None
    district: Optional[str] = None
    language: Optional[str] = None
    voice_enabled: Optional[bool] = None

class UserOut(UserBase):
    id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
