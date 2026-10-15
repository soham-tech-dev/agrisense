from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.auth.jwt import get_current_user_optional
from app.models.user import User
from app.models.feedback import Feedback
from app.schemas.feedback import FeedbackCreate, FeedbackOut

router = APIRouter()

@router.post("", response_model=FeedbackOut, status_code=status.HTTP_201_CREATED)
def submit_feedback(
    payload: FeedbackCreate,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """
    POST /api/v1/feedback
    Submit user feedback (helpful/not_helpful, reason, comment) for any AI feature result.
    """
    # Normalize rating values (e.g., thumbs_up -> helpful, thumbs_down -> not_helpful)
    rating_val = payload.rating.lower()
    if rating_val in ["thumbs_up", "like", "positive", "1"]:
        rating_val = "helpful"
    elif rating_val in ["thumbs_down", "dislike", "negative", "0"]:
        rating_val = "not_helpful"

    feedback_obj = Feedback(
        user_id=current_user.id if current_user else None,
        feature=payload.feature,
        reference_id=payload.reference_id,
        rating=rating_val,
        reason=payload.reason,
        comment=payload.comment
    )
    db.add(feedback_obj)
    db.commit()
    db.refresh(feedback_obj)

    return feedback_obj

@router.get("", response_model=List[FeedbackOut])
def list_feedback(
    feature: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    GET /api/v1/feedback
    List submitted feedback items.
    """
    query = db.query(Feedback)
    if feature:
        query = query.filter(Feedback.feature == feature)
    return query.order_by(Feedback.created_at.desc()).limit(100).all()
