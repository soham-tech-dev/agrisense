import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.database.session import Base

class Feedback(Base):
    __tablename__ = "feedbacks"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    feature = Column(String, nullable=False, index=True)  # e.g., 'disease', 'chat', 'weather', 'mandi', 'advisory'
    reference_id = Column(String, nullable=True, index=True)  # e.g., scan_id, message_id
    rating = Column(String, nullable=False)  # 'helpful' or 'not_helpful'
    reason = Column(String, nullable=True)  # 'correct', 'incorrect', 'not_clear', 'not_relevant', 'other'
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Optional relationship
    user = relationship("User", backref="feedbacks", lazy="joined")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "feature": self.feature,
            "reference_id": self.reference_id,
            "rating": self.rating,
            "reason": self.reason,
            "comment": self.comment,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
