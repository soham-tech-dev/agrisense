import os
import logging
from typing import List, Dict, Any, Optional
import chromadb
from chromadb.config import Settings as ChromaSettings
from app.core.config import settings

logger = logging.getLogger(__name__)

class VectorStoreService:
    def __init__(self):
        self.db_dir = os.path.abspath(settings.CHROMA_DB_DIR)
        os.makedirs(self.db_dir, exist_ok=True)
        
        # Initialize persistent Chroma client
        self.client = chromadb.PersistentClient(path=self.db_dir)
        
        # Use sentence-transformers embedding function
        self._embedding_model = None
        self._collection_name = "agrisense_kb"
        self.collection = self.client.get_or_create_collection(
            name=self._collection_name,
            metadata={"hnsw:space": "cosine"}
        )

    def _get_embedding_model(self):
        if self._embedding_model is None:
            try:
                from sentence_transformers import SentenceTransformer
                model_name = settings.EMBEDDING_MODEL_NAME
                logger.info(f"Loading SentenceTransformer model: {model_name}")
                self._embedding_model = SentenceTransformer(model_name)
            except Exception as e:
                logger.error(f"Error loading SentenceTransformer: {e}")
                self._embedding_model = None
        return self._embedding_model

    def generate_embedding(self, text: str) -> List[float]:
        model = self._get_embedding_model()
        if model:
            embedding = model.encode(text, convert_to_numpy=True).tolist()
            return embedding
        # Fallback dummy 384-dimensional vector if transformer model fails to load
        return [0.0] * 384

    def add_chunks(
        self,
        doc_id: str,
        chunks: List[str],
        metadata_template: Dict[str, Any]
    ) -> int:
        """
        Adds text chunks of a document to ChromaDB.
        """
        if not chunks:
            return 0
        
        ids = []
        embeddings = []
        metadatas = []
        documents = []

        for idx, chunk in enumerate(chunks):
            chunk_id = f"{doc_id}_chunk_{idx}"
            chunk_metadata = {**metadata_template, "doc_id": doc_id, "chunk_index": idx}
            
            # Sanitize metadata values for ChromaDB (no None values allowed)
            sanitized_metadata = {}
            for k, v in chunk_metadata.items():
                if v is None:
                    sanitized_metadata[k] = ""
                elif isinstance(v, (str, int, float, bool)):
                    sanitized_metadata[k] = v
                else:
                    sanitized_metadata[k] = str(v)

            emb = self.generate_embedding(chunk)
            
            ids.append(chunk_id)
            embeddings.append(emb)
            metadatas.append(sanitized_metadata)
            documents.append(chunk)

        self.collection.add(
            ids=ids,
            embeddings=embeddings,
            metadatas=metadatas,
            documents=documents
        )
        logger.info(f"Indexed {len(chunks)} chunks for document {doc_id} in ChromaDB")
        return len(chunks)

    def delete_document_chunks(self, doc_id: str):
        """
        Deletes all chunks associated with doc_id from ChromaDB.
        """
        try:
            results = self.collection.get(where={"doc_id": doc_id})
            if results and results.get("ids"):
                self.collection.delete(ids=results["ids"])
                logger.info(f"Deleted {len(results['ids'])} chunks for doc_id: {doc_id}")
        except Exception as e:
            logger.error(f"Error deleting chunks for doc_id {doc_id}: {e}")

    def query_similar(
        self,
        query_text: str,
        n_results: int = 4,
        where_filter: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """
        Query top similar document chunks for query_text.
        Returns list of dicts with document, metadata, and similarity distance score.
        """
        query_emb = self.generate_embedding(query_text)
        
        kwargs = {
            "query_embeddings": [query_emb],
            "n_results": n_results
        }
        if where_filter:
            kwargs["where"] = where_filter

        try:
            results = self.collection.query(**kwargs)
        except Exception as e:
            logger.error(f"ChromaDB query error: {e}")
            return []

        retrieved = []
        if results and results.get("documents") and len(results["documents"]) > 0:
            docs = results["documents"][0]
            metadatas = results["metadatas"][0] if results.get("metadatas") else [{}] * len(docs)
            distances = results["distances"][0] if results.get("distances") else [0.0] * len(docs)

            for doc, meta, dist in zip(docs, metadatas, distances):
                retrieved.append({
                    "content": doc,
                    "metadata": meta,
                    "distance": dist,  # Lower distance means higher similarity in cosine space
                    "similarity_score": round(max(0.0, 1.0 - dist), 4)
                })

        return retrieved

# Global instance
vector_store_service = VectorStoreService()
