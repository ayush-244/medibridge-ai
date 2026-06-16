import json
import re
import time
from typing import Any, Dict, List

from app.core.exceptions import LLMAPIError, NoDocumentsError, RecommendationGenerationError
from app.core.logger import logger
from app.core.specializations import SPECIALIZATIONS, normalize_specialization
from app.services.chat_service import build_context
from app.services.citation_service import build_citations
from app.services.llm_service import get_llm_service
from app.services.retriever_service import retrieve_chunks

CLINICAL_QUERIES = [
    "Primary diagnosis and medical conditions",
    "Patient symptoms and presenting complaints",
    "Medical history and past conditions",
    "Risk factors and comorbidities",
    "Current medications and prescriptions",
]

SPECIALIZATIONS_LIST = ", ".join(SPECIALIZATIONS)

RECOMMENDATION_PROMPT = (
    "You are MediBridge Referral Assistant.\n\n"
    "Analyze the supplied medical evidence.\n\n"
    "Determine the SINGLE most appropriate specialist.\n\n"
    "Rules:\n\n"
    "- Use only supplied evidence\n"
    "- Do not invent diagnoses\n"
    "- Do not invent symptoms\n"
    "- Do not speculate\n"
    "- Choose exactly one specialization from this list:\n"
    f"{SPECIALIZATIONS_LIST}\n\n"
    "Return JSON only.\n\n"
    "{{\n"
    '  "specialist": "",\n'
    '  "confidence": 0,\n'
    '  "reason": ""\n'
    "}}\n\n"
    "Confidence guidelines:\n"
    "- Strong evidence: 85-100\n"
    "- Moderate evidence: 60-84\n"
    "- Weak evidence: below 60\n\n"
    "Clinical Evidence:\n\n"
    "{context}"
)


def _merge_clinical_chunks(patient_id: str) -> List[Dict[str, Any]]:
    seen: set[tuple[str, int]] = set()
    merged: List[Dict[str, Any]] = []

    for query in CLINICAL_QUERIES:
        chunks = retrieve_chunks(patient_id=patient_id, query=query, top_k=3)
        for chunk in chunks:
            key = (chunk.get("fileName", ""), int(chunk.get("chunkIndex", 0)))
            if key in seen:
                continue
            seen.add(key)
            merged.append(chunk)

    merged.sort(key=lambda item: item.get("score", 0.0), reverse=True)
    return merged


def _parse_recommendation_response(raw_response: str) -> Dict[str, Any]:
    try:
        parsed = json.loads(raw_response)
    except json.JSONDecodeError:
        json_match = re.search(r"\{.*\}", raw_response, re.DOTALL)
        if not json_match:
            raise RecommendationGenerationError(
                "Failed to generate specialist recommendation."
            )
        try:
            parsed = json.loads(json_match.group())
        except json.JSONDecodeError as exc:
            raise RecommendationGenerationError(
                "Failed to generate specialist recommendation."
            ) from exc

    specialist_raw = str(parsed.get("specialist", "")).strip()
    reason = str(parsed.get("reason", "")).strip()
    confidence_raw = parsed.get("confidence", 0)

    specialist = normalize_specialization(specialist_raw)
    if not specialist:
        raise RecommendationGenerationError(
            "Failed to generate specialist recommendation."
        )

    if not reason:
        raise RecommendationGenerationError(
            "Failed to generate specialist recommendation."
        )

    try:
        confidence = int(round(float(confidence_raw)))
    except (TypeError, ValueError) as exc:
        raise RecommendationGenerationError(
            "Failed to generate specialist recommendation."
        ) from exc

    confidence = max(0, min(100, confidence))

    return {
        "specialist": specialist,
        "confidence": confidence,
        "reason": reason,
    }


def recommend_specialist(patient_id: str) -> Dict[str, Any]:
    sanitized_patient_id = patient_id.strip()
    request_start = time.perf_counter()

    logger.info(
        "Specialist recommendation requested for patientId=%s",
        sanitized_patient_id,
    )

    retrieval_start = time.perf_counter()
    chunks = _merge_clinical_chunks(sanitized_patient_id)
    retrieval_ms = round((time.perf_counter() - retrieval_start) * 1000, 2)
    logger.info(
        "Clinical chunks retrieved for patientId=%s count=%d duration_ms=%.2f",
        sanitized_patient_id,
        len(chunks),
        retrieval_ms,
    )

    if not chunks:
        raise NoDocumentsError("No medical documents found for this patient.")

    context = build_context(chunks)
    if not context.strip():
        raise NoDocumentsError("No medical documents found for this patient.")

    prompt = RECOMMENDATION_PROMPT.format(context=context)

    try:
        logger.info("OpenRouter recommendation request for patientId=%s", sanitized_patient_id)
        llm_start = time.perf_counter()
        raw_response = get_llm_service().generate_completion(
            prompt,
            response_json=True,
            temperature=0.1,
            max_tokens=1024,
        )
        llm_ms = round((time.perf_counter() - llm_start) * 1000, 2)
        logger.info(
            "OpenRouter recommendation completed for patientId=%s duration_ms=%.2f",
            sanitized_patient_id,
            llm_ms,
        )
    except LLMAPIError as exc:
        logger.error(
            "OpenRouter recommendation failed for patientId=%s: %s",
            sanitized_patient_id,
            exc,
        )
        raise RecommendationGenerationError(
            "Failed to generate specialist recommendation."
        ) from exc
    except Exception as exc:
        logger.error(
            "Recommendation generation failed for patientId=%s: %s",
            sanitized_patient_id,
            exc,
        )
        raise RecommendationGenerationError(
            "Failed to generate specialist recommendation."
        ) from exc

    recommendation = _parse_recommendation_response(raw_response)
    citations = build_citations(chunks)

    total_ms = round((time.perf_counter() - request_start) * 1000, 2)
    logger.info(
        "Specialist recommended for patientId=%s specialist=%s confidence=%d "
        "citations=%d retrieval_ms=%.2f llm_ms=%.2f total_ms=%.2f",
        sanitized_patient_id,
        recommendation["specialist"],
        recommendation["confidence"],
        len(citations),
        retrieval_ms,
        llm_ms,
        total_ms,
    )

    return {
        "specialist": recommendation["specialist"],
        "recommendedSpecialist": recommendation["specialist"],
        "confidence": recommendation["confidence"],
        "reason": recommendation["reason"],
        "supportingEvidence": citations,
    }
