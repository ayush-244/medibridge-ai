import json
import re
import time
from typing import Any, Dict, List

from app.core.exceptions import LLMAPIError, NoDocumentsError, RecommendationGenerationError
from app.core.logger import logger
from app.core.specializations import normalize_specialization
from app.services.chat_service import build_context
from app.services.citation_service import build_citations
from app.services.llm_service import get_llm_service
from app.services.recommendation_service import _merge_clinical_chunks

CLINICAL_INTELLIGENCE_PROMPT = (
    "You are MediBridge Clinical Intelligence Engine.\n\n"
    "Analyze the supplied medical evidence and produce a comprehensive clinical assessment.\n\n"
    "Rules:\n"
    "- Use ONLY the supplied medical records\n"
    "- Never hallucinate diagnoses or medications\n"
    "- If evidence is insufficient, set confidence below 30\n\n"
    "Return JSON only:\n"
    "{{\n"
    '  "primaryDiagnosis": "Primary diagnosis from records",\n'
    '  "riskLevel": "LOW | MEDIUM | HIGH | CRITICAL",\n'
    '  "medications": ["Medication 1", "Medication 2"],\n'
    '  "recommendedSpecialist": "Cardiology",\n'
    '  "urgency": "Routine | Urgent | Emergency | Critical",\n'
    '  "transferRecommendation": "Immediate Transfer | Transfer within 2 hours | Transfer within 24 hours | No transfer required",\n'
    '  "confidence": 0,\n'
    '  "aiFindings": ["Finding 1", "Finding 2"],\n'
    '  "evidence": ["Evidence point 1", "Evidence point 2"]\n'
    "}}\n\n"
    "Risk guidelines:\n"
    "- CRITICAL: life-threatening, requires immediate intervention\n"
    "- HIGH: serious condition requiring urgent specialist care\n"
    "- MEDIUM: chronic or moderate conditions needing follow-up\n"
    "- LOW: stable, routine care\n\n"
    "Clinical Evidence:\n\n"
    "{context}"
)


def _parse_intelligence_response(raw_response: str) -> Dict[str, Any]:
    try:
        parsed = json.loads(raw_response)
    except json.JSONDecodeError:
        json_match = re.search(r"\{.*\}", raw_response, re.DOTALL)
        if not json_match:
            raise RecommendationGenerationError(
                "Failed to generate clinical intelligence."
            )
        try:
            parsed = json.loads(json_match.group())
        except json.JSONDecodeError as exc:
            raise RecommendationGenerationError(
                "Failed to generate clinical intelligence."
            ) from exc

    risk_level = str(parsed.get("riskLevel", "MEDIUM")).strip().upper()
    if risk_level not in ("LOW", "MEDIUM", "HIGH", "CRITICAL"):
        risk_level = "MEDIUM"

    urgency = str(parsed.get("urgency", "Routine")).strip()
    transfer = str(parsed.get("transferRecommendation", "No transfer required")).strip()

    specialist_raw = str(parsed.get("recommendedSpecialist", "")).strip()
    specialist = normalize_specialization(specialist_raw) or specialist_raw or "General Medicine"

    medications = parsed.get("medications", [])
    if not isinstance(medications, list):
        medications = []
    medications = [str(m).strip() for m in medications if str(m).strip()][:10]

    ai_findings = parsed.get("aiFindings", [])
    if not isinstance(ai_findings, list):
        ai_findings = []
    ai_findings = [str(f).strip() for f in ai_findings if str(f).strip()][:6]

    evidence = parsed.get("evidence", [])
    if not isinstance(evidence, list):
        evidence = []
    evidence = [str(e).strip() for e in evidence if str(e).strip()][:6]

    try:
        confidence = int(round(float(parsed.get("confidence", 0))))
    except (TypeError, ValueError):
        confidence = 0
    confidence = max(0, min(100, confidence))

    return {
        "primaryDiagnosis": str(parsed.get("primaryDiagnosis", "Under review")).strip(),
        "riskLevel": risk_level,
        "medications": medications,
        "recommendedSpecialist": specialist,
        "urgency": urgency,
        "transferRecommendation": transfer,
        "confidence": confidence,
        "aiFindings": ai_findings,
        "evidence": evidence,
    }


def generate_clinical_intelligence(patient_id: str) -> Dict[str, Any]:
    sanitized_patient_id = patient_id.strip()
    request_start = time.perf_counter()

    logger.info(
        "Clinical intelligence requested for patientId=%s",
        sanitized_patient_id,
    )

    retrieval_start = time.perf_counter()
    chunks = _merge_clinical_chunks(sanitized_patient_id)
    retrieval_ms = round((time.perf_counter() - retrieval_start) * 1000, 2)

    if not chunks:
        raise NoDocumentsError("No medical documents found for this patient.")

    context = build_context(chunks)
    if not context.strip():
        raise NoDocumentsError("No medical documents found for this patient.")

    prompt = CLINICAL_INTELLIGENCE_PROMPT.format(context=context)

    try:
        llm_start = time.perf_counter()
        raw_response = get_llm_service().generate_completion(
            prompt,
            response_json=True,
            temperature=0.1,
            max_tokens=1536,
        )
        llm_ms = round((time.perf_counter() - llm_start) * 1000, 2)
    except LLMAPIError as exc:
        logger.error(
            "Clinical intelligence LLM failed for patientId=%s: %s",
            sanitized_patient_id,
            exc,
        )
        raise RecommendationGenerationError(
            "Failed to generate clinical intelligence."
        ) from exc

    intelligence = _parse_intelligence_response(raw_response)
    citations = build_citations(chunks)

    total_ms = round((time.perf_counter() - request_start) * 1000, 2)
    logger.info(
        "Clinical intelligence generated for patientId=%s risk=%s specialist=%s "
        "confidence=%d retrieval_ms=%.2f llm_ms=%.2f total_ms=%.2f",
        sanitized_patient_id,
        intelligence["riskLevel"],
        intelligence["recommendedSpecialist"],
        intelligence["confidence"],
        retrieval_ms,
        llm_ms,
        total_ms,
    )

    return {
        **intelligence,
        "citations": citations,
    }
