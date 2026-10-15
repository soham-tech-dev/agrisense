from typing import List, Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.chat import Conversation, ChatMessage
from app.services.rag_advisor import rag_advisor_service

router = APIRouter()

class ChatQueryRequest(BaseModel):
    query: str
    conversation_id: Optional[str] = None
    crop_context: Optional[str] = None
    language: Optional[str] = None
    district: Optional[str] = None

class FeedbackRequest(BaseModel):
    feedback: str  # 'thumbs_up', 'thumbs_down', or text comment

@router.post("", status_code=status.HTTP_200_OK)
def process_chat_query(
    req: ChatQueryRequest,
    db: Session = Depends(get_db)
):
    """
    POST /api/chat
    Process a farmer's agricultural query through RAG pipeline, store message history, and return grounded answer.
    """
    if not req.query or not req.query.strip():
        raise HTTPException(status_code=400, detail="Query string cannot be empty.")

    conversation = None
    if req.conversation_id:
        conversation = db.query(Conversation).filter(Conversation.id == req.conversation_id).first()

    if not conversation:
        # Create a new conversation thread
        title_text = req.query.strip()[:40] + ("..." if len(req.query.strip()) > 40 else "")
        conversation = Conversation(title=title_text)
        db.add(conversation)
        db.commit()
        db.refresh(conversation)

    # Save user message
    user_msg = ChatMessage(
        conversation_id=conversation.id,
        role="user",
        content=req.query,
        language=req.language or "mr"
    )
    db.add(user_msg)
    db.commit()

    # Get conversation history context
    past_messages = db.query(ChatMessage).filter(ChatMessage.conversation_id == conversation.id).order_by(ChatMessage.created_at).all()
    history = [{"role": m.role, "content": m.content} for m in past_messages[-6:]]

    # Execute RAG pipeline with user requested language preference
    rag_result = rag_advisor_service.answer_query(
        query=req.query,
        conversation_history=history,
        crop_context=req.crop_context,
        user_language=req.language,
        farm_district=req.district
    )

    # Save user language update
    user_msg.language = rag_result["language"]
    user_msg.intent = rag_result["intent"]
    db.commit()

    # Save assistant message
    assistant_msg = ChatMessage(
        conversation_id=conversation.id,
        role="assistant",
        content=rag_result["answer"],
        language=rag_result["language"],
        intent=rag_result["intent"],
        grounded=rag_result["grounded"]
    )
    assistant_msg.sources = rag_result["sources"]
    db.add(assistant_msg)
    
    # Touch conversation updated_at timestamp
    conversation.title = user_msg.content[:40] + ("..." if len(user_msg.content) > 40 else "")
    db.commit()
    db.refresh(assistant_msg)

    return {
        "conversation_id": conversation.id,
        "message_id": assistant_msg.id,
        "answer": rag_result["answer"],
        "language": rag_result["language"],
        "intent": rag_result["intent"],
        "sources": rag_result["sources"],
        "grounded": rag_result["grounded"],
        "response_state": rag_result.get("response_state", "ANSWERED_WITH_SOURCES"),
        "trace_id": rag_result.get("trace_id"),
        "clarification_prompt": rag_result.get("clarification_prompt"),
        "timestamp": assistant_msg.created_at.isoformat()
    }

@router.get("/conversations", response_model=List[dict])
def list_conversations(db: Session = Depends(get_db)):
    """
    GET /api/chat/conversations
    List all user chat conversations sorted by recent updates.
    """
    conversations = db.query(Conversation).order_by(Conversation.updated_at.desc()).all()
    return [c.to_dict() for c in conversations]

@router.get("/conversations/{conversation_id}")
def get_conversation_detail(conversation_id: str, db: Session = Depends(get_db)):
    """
    GET /api/chat/conversations/{id}
    Get conversation details with complete chat message history.
    """
    conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    messages = db.query(ChatMessage).filter(ChatMessage.conversation_id == conversation_id).order_by(ChatMessage.created_at.asc()).all()
    
    return {
        **conversation.to_dict(),
        "messages": [m.to_dict() for m in messages]
    }

@router.delete("/conversations/{conversation_id}", status_code=status.HTTP_200_OK)
def delete_conversation(conversation_id: str, db: Session = Depends(get_db)):
    """
    DELETE /api/chat/conversations/{id}
    Delete a conversation thread and associated chat messages.
    """
    conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    db.delete(conversation)
    db.commit()
    return {"message": "Conversation deleted successfully", "id": conversation_id}

@router.post("/messages/{message_id}/feedback")
def submit_message_feedback(
    message_id: str,
    req: FeedbackRequest,
    db: Session = Depends(get_db)
):
    """
    POST /api/chat/messages/{id}/feedback
    Submit user feedback (thumbs_up, thumbs_down, or review comment) on an AI response.
    """
    msg = db.query(ChatMessage).filter(ChatMessage.id == message_id).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Chat message not found")

    msg.feedback = req.feedback
    db.commit()
    return {"message": "Feedback recorded successfully", "id": message_id, "feedback": req.feedback}
