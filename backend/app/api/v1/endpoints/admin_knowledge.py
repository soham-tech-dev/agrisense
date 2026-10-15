import os
import shutil
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.knowledge import KnowledgeDocument
from app.services.document_ingestion import document_ingestion_service
from app.services.vector_store import vector_store_service

router = APIRouter()

UPLOAD_DIR = "static/knowledge_docs"

@router.get("", response_model=List[dict])
def list_knowledge_documents(db: Session = Depends(get_db)):
    """
    Get all verified agricultural knowledge documents.
    """
    docs = db.query(KnowledgeDocument).order_by(KnowledgeDocument.uploaded_at.desc()).all()
    return [d.to_dict() for d in docs]

@router.post("", status_code=status.HTTP_201_CREATED)
async def create_knowledge_document(
    title: str = Form(...),
    organization: str = Form("KVK"),
    crop: str = Form("All"),
    topic: str = Form("General"),
    language: str = Form("en"),
    source: Optional[str] = Form(None),
    year: int = Form(2024),
    version: str = Form("1.0"),
    verified: bool = Form(True),
    raw_content: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    """
    POST /api/admin/knowledge
    Create a new knowledge base document entry (upload file or pass raw text).
    """
    doc_id = f"doc_{uuid.uuid4().hex[:10]}"
    file_path = None

    if file:
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        file_extension = os.path.splitext(file.filename)[1]
        file_path = os.path.join(UPLOAD_DIR, f"{doc_id}{file_extension}")
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

    new_doc = KnowledgeDocument(
        id=doc_id,
        title=title,
        organization=organization,
        crop=crop,
        topic=topic,
        language=language,
        source=source or (file.filename if file else "Manual Input"),
        year=year,
        version=version,
        verified=verified,
        file_path=file_path
    )
    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)

    # Index into ChromaDB if content or file is available
    if file_path or raw_content:
        try:
            metadata = new_doc.to_dict()
            chunk_count, summary = document_ingestion_service.process_and_index_document(
                doc_id=new_doc.id,
                file_path=file_path,
                doc_metadata=metadata,
                raw_text_content=raw_content
            )
            new_doc.chunk_count = chunk_count
            new_doc.content_summary = summary
            db.commit()
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Document indexing failed: {str(e)}"
            )

    return new_doc.to_dict()

@router.delete("/{doc_id}", status_code=status.HTTP_200_OK)
def delete_knowledge_document(doc_id: str, db: Session = Depends(get_db)):
    """
    DELETE /api/admin/knowledge/{id}
    Remove document metadata from DB and delete indexed vector chunks from ChromaDB.
    """
    doc = db.query(KnowledgeDocument).filter(KnowledgeDocument.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Knowledge document not found")

    # Remove vector chunks from ChromaDB
    vector_store_service.delete_document_chunks(doc_id)

    # Delete local stored file if present
    if doc.file_path and os.path.exists(doc.file_path):
        try:
            os.remove(doc.file_path)
        except Exception:
            pass

    db.delete(doc)
    db.commit()
    return {"message": "Knowledge document and vector chunks deleted successfully", "id": doc_id}

@router.post("/{doc_id}/index", status_code=status.HTTP_200_OK)
def reindex_knowledge_document(
    doc_id: str,
    raw_content: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    """
    POST /api/admin/knowledge/{id}/index
    Re-trigger text extraction, chunking, embedding, and indexing into ChromaDB for document.
    """
    doc = db.query(KnowledgeDocument).filter(KnowledgeDocument.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Knowledge document not found")

    if not doc.file_path and not raw_content and not doc.content_summary:
        raise HTTPException(
            status_code=400,
            detail="Cannot index document: no attached file or text content provided."
        )

    try:
        metadata = doc.to_dict()
        chunk_count, summary = document_ingestion_service.process_and_index_document(
            doc_id=doc.id,
            file_path=doc.file_path,
            doc_metadata=metadata,
            raw_text_content=raw_content or doc.content_summary
        )
        doc.chunk_count = chunk_count
        doc.content_summary = summary
        db.commit()
        return {
            "message": "Document re-indexed successfully",
            "doc_id": doc_id,
            "chunk_count": chunk_count,
            "summary": summary
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Indexing failed: {str(e)}")
