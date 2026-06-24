import json
import re
import time
from typing import Any, Dict, List, Optional

from app.core.exceptions import LLMAPIError, NoDocumentsError, RecommendationGenerationError
from app.core.logger import logger
from app.core.specializations import SPECIALIZATIONS, normalize_specialization
from app.models.schemas import ReferralAutofillData
from app.services.chat_service import build_context
from app.services.llm_service import get_llm_service
from app.services.retriever_service import retrieve_chunks

VALID_PRIORITIES = {"LOW", "MEDIUM", "HIGH", "CRITICAL"}

EXTRACTION_PROMPT = (
    "You are MediBridge Referral Assistant.\n\n"
    "Analyze the supplied clinical document text to extract structured referral information.\n\n"
    "Extract the following fields ONLY if explicitly mentioned in the text:\n"
    "- patientName: Full name of the patient\n"
    "- age: Patient age as a number\n"
    "- gender: Patient gender (MALE, FEMALE, OTHER, or PREFER_NOT_TO_SAY)\n"
    "- diagnosis: Primary medical diagnosis\n"
    "- conditionSummary: Brief clinical summary of the patient's condition\n"
    "- priority: Clinical urgency (LOW, MEDIUM, HIGH, or CRITICAL)\n"
    "- requiredSpecialty: The medical specialty needed, from this list:\n"
    f"{', '.join(SPECIALIZATIONS)}\n\n"
    "Rules:\n"
    "- Use ONLY the provided document text\n"
    "- Do NOT infer, guess, or hallucinate missing information\n"
    "- If a field is not explicitly mentioned in the text, return null\n"
    "- For priority, only set a value if the document uses explicit urgency language\n"
    "- For requiredSpecialty, map to the closest valid specialty from the list\n\n"
    "Return ONLY valid JSON. No markdown. No explanations.\n\n"
    "{{\n"
    '  "patientName": null,\n'
    '  "age": null,\n'
    '  "gender": null,\n'
    '  "diagnosis": null,\n'
    '  "conditionSummary": null,\n'
    '  "priority": null,\n'
    '  "requiredSpecialty": null\n'
    "}}\n\n"
    "Clinical Document Text:\n\n"
    "{context}"
)


def _retrieve_all_chunks(patient_id: str) -> List[Dict[str, Any]]:
    queries = [
        "Patient identification and demographics",
        "Diagnosis and medical condition",
        "Clinical assessment and findings",
        "Medical history and treatment plan",
    ]
    seen: set[tuple[str, int]] = set()
    merged: List[Dict[str, Any]] = []

    for query in queries:
        chunks = retrieve_chunks(patient_id=patient_id, query=query, top_k=5)
        for chunk in chunks:
            key = (chunk.get("fileName", ""), int(chunk.get("chunkIndex", 0)))
            if key in seen:
                continue
            seen.add(key)
            merged.append(chunk)

    merged.sort(key=lambda item: item.get("score", 0.0), reverse=True)
    return merged


def _parse_extraction_response(raw_response: str) -> Dict[str, Any]:
    try:
        parsed = json.loads(raw_response)
    except json.JSONDecodeError:
        json_match = re.search(r"\{.*\}", raw_response, re.DOTALL)
        if not json_match:
            raise RecommendationGenerationError(
                "Unable to extract patient information from this document."
            )
        try:
            parsed = json.loads(json_match.group())
        except json.JSONDecodeError as exc:
            raise RecommendationGenerationError(
                "Unable to extract patient information from this document."
            ) from exc

    if isinstance(parsed, list):
        if not parsed:
            raise RecommendationGenerationError(
                "Unable to extract patient information from this document."
            )
        parsed = parsed[0]
        if not isinstance(parsed, dict):
            raise RecommendationGenerationError(
                "Unable to extract patient information from this document."
            )

    patient_name = parsed.get("patientName")
    if patient_name is not None:
        patient_name = str(patient_name).strip() or None

    age = parsed.get("age")
    if age is not None:
        try:
            age = int(round(float(age)))
            if age <= 0 or age > 150:
                age = None
        except (TypeError, ValueError):
            age = None

    gender = parsed.get("gender")
    if gender is not None:
        gender = str(gender).strip().upper()
        if gender not in {"MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"}:
            if "male" in gender.lower() or "man" in gender.lower():
                gender = "MALE"
            elif "female" in gender.lower() or "woman" in gender.lower():
                gender = "FEMALE"
            else:
                gender = None

    diagnosis = parsed.get("diagnosis")
    if diagnosis is not None:
        diagnosis = str(diagnosis).strip() or None

    condition_summary = parsed.get("conditionSummary")
    if condition_summary is not None:
        condition_summary = str(condition_summary).strip() or None

    priority = parsed.get("priority")
    if priority is not None:
        priority = str(priority).strip().upper()
        if priority not in VALID_PRIORITIES:
            priority = None

    required_specialty = parsed.get("requiredSpecialty")
    if required_specialty is not None:
        required_specialty = normalize_specialization(str(required_specialty))

    return {
        "patientName": patient_name,
        "age": age,
        "gender": gender,
        "diagnosis": diagnosis,
        "conditionSummary": condition_summary,
        "priority": priority,
        "requiredSpecialty": required_specialty,
    }


def extract_referral_data(
    patient_id: str,
    referral_context: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    sanitized_patient_id = patient_id.strip()
    request_start = time.perf_counter()

    logger.info(
        "Referral extraction requested for patientId=%s",
        sanitized_patient_id,
    )

    retrieval_start = time.perf_counter()
    chunks = _retrieve_all_chunks(sanitized_patient_id)
    retrieval_ms = round((time.perf_counter() - retrieval_start) * 1000, 2)

    logger.info(
        "Document chunks retrieved for extraction patientId=%s count=%d duration_ms=%.2f",
        sanitized_patient_id,
        len(chunks),
        retrieval_ms,
    )

    if not chunks:
        logger.info(
            "No documents for patientId=%s — cannot extract",
            sanitized_patient_id,
        )
        raise NoDocumentsError(
            "No clinical documents found for extraction. "
            "Please upload a document first."
        )

    context = build_context(chunks)
    if not context.strip():
        raise NoDocumentsError(
            "No clinical documents found for extraction. "
            "Please upload a document first."
        )

    prompt = EXTRACTION_PROMPT.format(context=context)

    llm_ms = 0.0
    try:
        logger.info(
            "OpenRouter extraction request for patientId=%s",
            sanitized_patient_id,
        )
        llm_start = time.perf_counter()
        raw_response = get_llm_service().generate_completion(
            prompt,
            response_json=True,
            temperature=0.05,
            max_tokens=1024,
        )
        llm_ms = round((time.perf_counter() - llm_start) * 1000, 2)
        logger.info(
            "OpenRouter extraction completed for patientId=%s duration_ms=%.2f",
            sanitized_patient_id,
            llm_ms,
        )
    except LLMAPIError as exc:
        logger.error(
            "OpenRouter extraction failed for patientId=%s: %s",
            sanitized_patient_id,
            exc,
        )
        raise RecommendationGenerationError(
            "Unable to extract patient information from this document. "
            "Please review the document or complete the form manually."
        ) from exc
    except Exception as exc:
        logger.error(
            "Extraction generation failed for patientId=%s: %s",
            sanitized_patient_id,
            exc,
        )
        raise RecommendationGenerationError(
            "Unable to extract patient information from this document. "
            "Please review the document or complete the form manually."
        ) from exc

    extracted = _parse_extraction_response(raw_response)

    total_ms = round((time.perf_counter() - request_start) * 1000, 2)
    logger.info(
        "Referral extraction complete for patientId=%s "
        "has_name=%s has_age=%s has_diagnosis=%s total_ms=%.2f",
        sanitized_patient_id,
        extracted.get("patientName") is not None,
        extracted.get("age") is not None,
        extracted.get("diagnosis") is not None,
        total_ms,
    )

    return extracted
