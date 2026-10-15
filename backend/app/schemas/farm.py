from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class FarmBase(BaseModel):
    land_size: float = 1.0
    ownership_type: str = "owned"  # owned | leased | sharecropped
    location: Optional[str] = None

class FarmCreate(FarmBase):
    pass

class FarmUpdate(BaseModel):
    land_size: Optional[float] = None
    ownership_type: Optional[str] = None
    location: Optional[str] = None

class FarmOut(FarmBase):
    id: str
    user_id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
