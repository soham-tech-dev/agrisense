import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database.session import Base

class Farm(Base):
    __tablename__ = "farms"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    land_size = Column(Float, nullable=False, default=1.0)  # Land size in acres
    ownership_type = Column(String, nullable=False, default="owned")  # owned | leased | sharecropped
    location = Column(String, nullable=True)  # GPS coordinates or landmark description
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    owner = relationship("User", back_populates="farms")
