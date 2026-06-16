from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from uuid import uuid4

import chromadb

from app.core.config import Settings, get_settings
from app.core.exceptions import VectorStoreError
from app.core.logger import logger

_client: Optional[chromadb.PersistentClient] = None
_collection: Optional[chromadb.Collection] = None


def _get_collection(settings: Settings) -> chromadb.Collection:
    global _client, _collection

    if _collection is None:
        logger.info("Initializing ChromaDB at %s", settings.chroma_dir)
        _client = chromadb.PersistentClient(path=str(settings.chroma_dir))
        _collection = _client.get_or_create_collection(
            name=settings.chroma_collection,
            metadata={"hnsw:space": "cosine"},
        )
        logger.info("ChromaDB collection ready: %s", settings.chroma_collection)

    return _collection


def validate_chroma_connection(settings: Optional[Settings] = None) -> None:
    config = settings or get_settings()
    try:
        collection = _get_collection(config)
        collection.count()
        logger.info("ChromaDB connection validated successfully")
    except Exception as exc:
        logger.error("ChromaDB validation failed: %s", exc)
        raise VectorStoreError(f"ChromaDB is not accessible: {exc}") from exc


def store_document_chunks(
    chunks: List[str],
    embeddings: List[List[float]],
    file_name: str,
    patient_id: Optional[str] = None,
    uploaded_by: Optional[str] = None,
    settings: Optional[Settings] = None,
) -> int:
    if not chunks:
        return 0

    if len(chunks) != len(embeddings):
        raise VectorStoreError("Chunk and embedding counts must match")

    config = settings or get_settings()
    upload_date = datetime.now(timezone.utc).isoformat()
    patient_value = patient_id or ""
    uploaded_by_value = uploaded_by or ""
    document_id = uuid4().hex

    ids = [f"{document_id}_{index}" for index in range(len(chunks))]
    metadatas: List[Dict[str, Any]] = [
        {
            "patientId": patient_value,
            "fileName": file_name,
            "uploadDate": upload_date,
            "uploadedBy": uploaded_by_value,
            "chunkIndex": index,
        }
        for index in range(len(chunks))
    ]

    try:
        collection = _get_collection(config)
        collection.add(
            ids=ids,
            documents=chunks,
            embeddings=embeddings,
            metadatas=metadatas,
        )
        logger.info(
            "Stored %d chunks for file=%s patientId=%s",
            len(chunks),
            file_name,
            patient_value,
        )
        return len(chunks)
    except Exception as exc:
        logger.error("ChromaDB storage failed for file=%s: %s", file_name, exc)
        raise VectorStoreError(f"Failed to store document chunks: {exc}") from exc


def query_document_chunks(
    query_embedding: List[float],
    patient_id: str,
    top_k: int = 5,
    settings: Optional[Settings] = None,
) -> List[Dict[str, Any]]:
    config = settings or get_settings()

    try:
        collection = _get_collection(config)
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k,
            where={"patientId": patient_id},
            include=["documents", "metadatas", "distances"],
        )
    except Exception as exc:
        logger.error(
            "ChromaDB query failed for patientId=%s: %s",
            patient_id,
            exc,
        )
        raise VectorStoreError(f"Failed to query document chunks: {exc}") from exc

    documents = results.get("documents") or [[]]
    metadatas = results.get("metadatas") or [[]]
    distances = results.get("distances") or [[]]

    chunks: List[Dict[str, Any]] = []
    for text, metadata, distance in zip(documents[0], metadatas[0], distances[0]):
        chunks.append(
            {
                "text": text,
                "metadata": metadata or {},
                "distance": distance,
            }
        )

    logger.info(
        "ChromaDB query returned %d chunks for patientId=%s top_k=%d",
        len(chunks),
        patient_id,
        top_k,
    )
    return chunks
