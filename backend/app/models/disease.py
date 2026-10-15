import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.database.session import Base

class DiseaseCatalog(Base):
    __tablename__ = "disease_catalog"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    crop = Column(String, nullable=False, index=True)
    name_en = Column(String, nullable=False, index=True)
    name_mr = Column(String, nullable=False)
    symptoms_en = Column(Text, nullable=False)
    symptoms_mr = Column(Text, nullable=False)
    advisory_en = Column(Text, nullable=False)
    advisory_mr = Column(Text, nullable=False)
    prevention_en = Column(Text, nullable=True)
    prevention_mr = Column(Text, nullable=True)
    source = Column(String, nullable=True, default="PlantVillage")
    active = Column(Boolean, default=True)


class DiseaseScan(Base):
    __tablename__ = "disease_scans"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    crop_id = Column(String, ForeignKey("crops.id"), nullable=True)
    image_url = Column(String, nullable=False)
    prediction = Column(String, nullable=False)
    confidence = Column(Float, nullable=False)
    model_version = Column(String, nullable=False, default="v1.0.0-mobilenetv2")
    created_at = Column(DateTime, default=datetime.utcnow)

    # Feedback fields
    feedback_accurate = Column(Boolean, nullable=True)
    feedback_text = Column(Text, nullable=True)

    # Relationships
    user = relationship("User", backref="disease_scans")
    crop_rel = relationship("Crop", backref="disease_scans")
