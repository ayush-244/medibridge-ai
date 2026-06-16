import time
from typing import Any, Dict, List, Optional

from app.core.config import Settings, get_settings
from app.core.logger import logger
from app.services.embedding_service import generate_embeddings
from app.services.vector_service import query_document_chunks


def _distance_to_score(distance: float) -> float:
    return round(max(0.0, 1.0 - distance), 4)


def _deduplicate_chunks(chunks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    seen: set[tuple[str, int]] = set()
    unique: List[Dict[str, Any]] = []

    for chunk in chunks:
        key = (chunk["fileName"], chunk["chunkIndex"])
        if key in seen:
            continue
        seen.add(key)
        unique.append(chunk)

    return unique


def retrieve_chunks(
    patient_id: str,
    query: str,
    top_k: int = 5,
    settings: Optional[Settings] = None,
) -> List[Dict[str, Any]]:
    config = settings or get_settings()
    sanitized_patient_id = patient_id.strip()
    sanitized_query = query.strip()

    logger.info(
        "Retrieving chunks for patientId=%s query_length=%d top_k=%d",
        sanitized_patient_id,
        len(sanitized_query),
        top_k,
    )

    embed_start = time.perf_counter()
    query_embeddings = generate_embeddings([sanitized_query], settings=config)
    embed_ms = round((time.perf_counter() - embed_start) * 1000, 2)
    if not query_embeddings:
        logger.info("No embedding generated for query patientId=%s", sanitized_patient_id)
        return []

    query_start = time.perf_counter()
    raw_results = query_document_chunks(
        query_embedding=query_embeddings[0],
        patient_id=sanitized_patient_id,
        top_k=top_k,
        settings=config,
    )
    query_ms = round((time.perf_counter() - query_start) * 1000, 2)

    results: List[Dict[str, Any]] = []
    for item in raw_results:
        metadata = item.get("metadata") or {}
        results.append(
            {
                "text": item.get("text") or "",
                "fileName": metadata.get("fileName", ""),
                "chunkIndex": int(metadata.get("chunkIndex", 0)),
                "score": _distance_to_score(float(item.get("distance", 1.0))),
            }
        )

    results.sort(key=lambda chunk: chunk["score"], reverse=True)
    results = _deduplicate_chunks(results)

    logger.info(
        "Retrieved %d unique chunks for patientId=%s embed_ms=%.2f query_ms=%.2f",
        len(results),
        sanitized_patient_id,
        embed_ms,
        query_ms,
    )
    return results
