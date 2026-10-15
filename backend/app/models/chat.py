import uuid
import json
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database.session import Base

class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    title = Column(String, nullable=False, default="AgriSense Chat")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    messages = relationship("ChatMessage", back_populates="conversation", cascade="all, delete-orphan", order_by="ChatMessage.created_at")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "title": self.title,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "message_count": len(self.messages) if self.messages else 0
        }

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    conversation_id = Column(String, ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False)
    role = Column(String, nullable=False)  # 'user' or 'assistant'
    content = Column(Text, nullable=False)
    language = Column(String, default="mr")  # 'mr' or 'en'
    intent = Column(String, default="GENERAL_AGRICULTURE")
    sources_json = Column(Text, nullable=True, default="[]")  # JSON encoded list of source metadata objects
    grounded = Column(Boolean, default=True)  # True if answer grounded in KVK/ICAR sources, False if safety fallback triggered
    feedback = Column(String, nullable=True)  # 'thumbs_up', 'thumbs_down', or user comment
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    conversation = relationship("Conversation", back_populates="messages")

    @property
    def sources(self):
        if self.sources_json:
            try:
                return json.loads(self.sources_json)
            except Exception:
                return []
        return []

    @sources.setter
    def sources(self, value):
        self.sources_json = json.dumps(value) if value is not None else "[]"

    def to_dict(self):
        return {
            "id": self.id,
            "conversation_id": self.conversation_id,
            "role": self.role,
            "content": self.content,
            "language": self.language,
            "intent": self.intent,
            "sources": self.sources,
            "grounded": self.grounded,
            "feedback": self.feedback,
            "timestamp": self.created_at.isoformat() if self.created_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
