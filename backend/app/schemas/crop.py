from pydantic import BaseModel, ConfigDict
from typing import Optional

class CropBase(BaseModel):
    name_en: str
    name_mr: str
    category: Optional[str] = "Vegetable"
    is_active: bool = True

class CropOut(CropBase):
    id: str

    model_config = ConfigDict(from_attributes=True)

class UserCropCreate(BaseModel):
    crop_id: str
    season: Optional[str] = "Kharif"
    acres_allocated: Optional[float] = 1.0

class UserCropOut(BaseModel):
    id: str
    user_id: str
    crop_id: str
    season: Optional[str]
    acres_allocated: Optional[float]
    crop: CropOut

    model_config = ConfigDict(from_attributes=True)
