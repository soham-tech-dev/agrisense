import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Boolean, DateTime, Text
from app.database.session import Base

class KnowledgeDocument(Base):
    __tablename__ = "knowledge_documents"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False)
    organization = Column(String, default="KVK")  # e.g., KVK, ICAR, MPKV
    crop = Column(String, default="All")  # e.g., Onion, Sugarcane, Tomato, Cotton, Soybean, All
    topic = Column(String, default="General")  # e.g., Disease, Pest, Irrigation, Spraying, Mandi, General
    language = Column(String, default="en")  # 'en' or 'mr'
    source = Column(String, nullable=True)  # URL or source description
    year = Column(Integer, default=datetime.utcnow().year)
    version = Column(String, default="1.0")
    verified = Column(Boolean, default=True)
    file_path = Column(String, nullable=True)
    chunk_count = Column(Integer, default=0)
    content_summary = Column(Text, nullable=True)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "organization": self.organization,
            "crop": self.crop,
            "topic": self.topic,
            "language": self.language,
            "source": self.source,
            "year": self.year,
            "version": self.version,
            "verified": self.verified,
            "chunk_count": self.chunk_count,
            "content_summary": self.content_summary,
            "uploaded_at": self.uploaded_at.isoformat() if self.uploaded_at else None
        }
