import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database.session import Base

class UserCrop(Base):
    __tablename__ = "user_crops"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    crop_id = Column(String, ForeignKey("crops.id", ondelete="CASCADE"), nullable=False)
    season = Column(String, nullable=True, default="Kharif")  # Kharif | Rabi | Summer
    acres_allocated = Column(Float, nullable=True, default=1.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="user_crops")
    crop = relationship("Crop", back_populates="user_crops")
