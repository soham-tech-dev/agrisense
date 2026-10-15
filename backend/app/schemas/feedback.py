from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class FeedbackCreate(BaseModel):
    feature: str  # 'disease', 'chat', 'weather', 'mandi', 'advisory'
    reference_id: Optional[str] = None
    rating: str  # 'helpful' or 'not_helpful' (or 'thumbs_up' / 'thumbs_down')
    reason: Optional[str] = None  # 'correct', 'incorrect', 'not_clear', 'not_relevant', 'other'
    comment: Optional[str] = None

class FeedbackOut(BaseModel):
    id: str
    user_id: Optional[str] = None
    feature: str
    reference_id: Optional[str] = None
    rating: str
    reason: Optional[str] = None
    comment: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
