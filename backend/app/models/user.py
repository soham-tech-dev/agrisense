import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Text
from sqlalchemy.orm import relationship
from app.database.session import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    phone = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=True)
    name = Column(String, nullable=True)
    village = Column(String, nullable=True)
    taluka = Column(String, nullable=True)
    district = Column(String, nullable=True)
    language = Column(String, default="mr")  # 'mr' (Marathi) or 'en' (English)
    role = Column(String, default="FARMER", nullable=False)  # 'FARMER' or 'ADMIN'
    voice_enabled = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    farms = relationship("Farm", back_populates="owner", cascade="all, delete-orphan")
    user_crops = relationship("UserCrop", back_populates="user", cascade="all, delete-orphan")
