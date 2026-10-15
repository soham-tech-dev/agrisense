import uuid
from sqlalchemy import Column, String, Boolean
from sqlalchemy.orm import relationship
from app.database.session import Base

class Crop(Base):
    __tablename__ = "crops"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name_en = Column(String, nullable=False, index=True)
    name_mr = Column(String, nullable=False, index=True)
    category = Column(String, nullable=True, default="Vegetable")
    is_active = Column(Boolean, default=True)
    
    # Relationships
    user_crops = relationship("UserCrop", back_populates="crop", cascade="all, delete-orphan")
