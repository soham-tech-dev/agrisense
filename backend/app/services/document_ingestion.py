import os
import re
import logging
from typing import List, Dict, Any, Tuple
from app.services.vector_store import vector_store_service

logger = logging.getLogger(__name__)

class DocumentIngestionService:
    @staticmethod
    def extract_text_from_file(file_path: str) -> str:
        """
        Extract raw text content from PDF or text file.
        """
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")

        ext = os.path.splitext(file_path)[1].lower()
        text = ""

        if ext == ".pdf":
            try:
                import pypdf
                reader = pypdf.PdfReader(file_path)
                for page in reader.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n\n"
            except Exception as e:
                logger.error(f"Error extracting PDF text from {file_path}: {e}")
                raise ValueError(f"Failed to read PDF file: {str(e)}")
        else:
            # Plain text / Markdown / HTML fallback
            try:
                with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                    text = f.read()
            except Exception as e:
                raise ValueError(f"Failed to read text file: {str(e)}")

        return DocumentIngestionService.clean_text(text)

    @staticmethod
    def clean_text(text: str) -> str:
        """
        Clean and normalize extracted text.
        """
        if not text:
            return ""
        # Replace multiple newlines with double newline
        text = re.sub(r'\r\n', '\n', text)
        text = re.sub(r'\n{3,}', '\n\n', text)
        # Normalize spaces
        text = re.sub(r'[ \t]+', ' ', text)
        return text.strip()

    @staticmethod
    def chunk_text(text: str, chunk_size: int = 500, chunk_overlap: int = 80) -> List[str]:
        """
        Split text into overlapping chunks respecting sentence/paragraph boundaries.
        """
        if not text:
            return []

        # Split into paragraphs first
        paragraphs = [p.strip() for p in text.split('\n\n') if p.strip()]
        chunks = []
        current_chunk = ""

        for p in paragraphs:
            if len(current_chunk) + len(p) + 2 <= chunk_size:
                current_chunk = (current_chunk + "\n\n" + p).strip()
            else:
                if current_chunk:
                    chunks.append(current_chunk)
                
                # If paragraph itself is longer than chunk_size, split by sentences
                if len(p) > chunk_size:
                    sentences = re.split(r'(?<=[.!?।])\s+', p)
                    sub_chunk = ""
                    for s in sentences:
                        if len(sub_chunk) + len(s) + 1 <= chunk_size:
                            sub_chunk = (sub_chunk + " " + s).strip()
                        else:
                            if sub_chunk:
                                chunks.append(sub_chunk)
                            sub_chunk = s
                    if sub_chunk:
                        current_chunk = sub_chunk
                else:
                    current_chunk = p

        if current_chunk:
            chunks.append(current_chunk)

        # Add overlap if needed
        if chunk_overlap > 0 and len(chunks) > 1:
            overlapped_chunks = []
            for idx, c in enumerate(chunks):
                if idx > 0:
                    prev_tail = chunks[idx-1][-chunk_overlap:]
                    overlapped_chunks.append(prev_tail + " " + c)
                else:
                    overlapped_chunks.append(c)
            return overlapped_chunks

        return chunks

    @staticmethod
    def process_and_index_document(
        doc_id: str,
        file_path: Optional[str],
        doc_metadata: Dict[str, Any],
        raw_text_content: Optional[str] = None
    ) -> Tuple[int, str]:
        """
        Extracts, chunks, embeds, and indexes a document into ChromaDB.
        Returns (chunk_count, summary).
        """
        if file_path:
            text = DocumentIngestionService.extract_text_from_file(file_path)
        elif raw_text_content:
            text = DocumentIngestionService.clean_text(raw_text_content)
        else:
            raise ValueError("Either file_path or raw_text_content must be provided.")

        if not text or len(text.strip()) < 10:
            raise ValueError("Document contains insufficient text content.")

        chunks = DocumentIngestionService.chunk_text(text)
        
        # Remove any existing vector chunks for this doc first
        vector_store_service.delete_document_chunks(doc_id)
        
        # Index chunks in ChromaDB
        indexed_count = vector_store_service.add_chunks(
            doc_id=doc_id,
            chunks=chunks,
            metadata_template=doc_metadata
        )

        summary = text[:250] + ("..." if len(text) > 250 else "")
        return indexed_count, summary

document_ingestion_service = DocumentIngestionService()
