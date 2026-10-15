from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field

class DiseaseCatalogBase(BaseModel):
    crop: str
    name_en: str
    name_mr: str
    symptoms_en: str
    symptoms_mr: str
    advisory_en: str
    advisory_mr: str
    prevention_en: Optional[str] = None
    prevention_mr: Optional[str] = None
    source: Optional[str] = "PlantVillage"
    active: bool = True

class DiseaseCatalogCreate(DiseaseCatalogBase):
    id: Optional[str] = None

class DiseaseCatalogOut(DiseaseCatalogBase):
    id: str

    class Config:
        from_attributes = True

class DiseasePredictResponse(BaseModel):
    scan_id: str
    user_id: str
    crop_id: Optional[str] = None
    image_url: str
    prediction: str
    confidence: float
    model_version: str
    is_low_confidence: bool
    warning: Optional[str] = None
    disease_info: Optional[DiseaseCatalogOut] = None
    created_at: datetime

    class Config:
        from_attributes = True

class DiseaseScanOut(BaseModel):
    id: str
    user_id: str
    crop_id: Optional[str] = None
    image_url: str
    prediction: str
    confidence: float
    model_version: str
    created_at: datetime
    feedback_accurate: Optional[bool] = None
    feedback_text: Optional[str] = None
    disease_info: Optional[DiseaseCatalogOut] = None

    class Config:
        from_attributes = True

class DiseaseFeedbackCreate(BaseModel):
    is_accurate: bool
    feedback_text: Optional[str] = None

class DiseaseFeedbackOut(BaseModel):
    id: str
    feedback_accurate: bool
    feedback_text: Optional[str] = None
    message: str
