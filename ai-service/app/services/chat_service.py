import json
import re
from typing import Any, Dict, List

from app.core.exceptions import ChatGenerationError, LLMAPIError, NoDocumentsError
from app.core.logger import logger
from app.services.citation_service import build_citations
from app.services.llm_service import get_llm_service
from app.services.retriever_service import retrieve_chunks

MAX_CONTEXT_CHARS = 6000

COPILOT_JSON_PROMPT = (
    "You are MediBridge Clinical Copilot.\n\n"
    "You assist doctors, specialists, referral coordinators, and hospital administrators.\n\n"
    "Rules:\n"
    "1. Use ONLY the supplied medical records.\n"
    "2. Never hallucinate.\n"
    "3. Never invent diagnoses.\n"
    "4. Never invent medications.\n"
    "5. Explain findings clearly.\n"
    "6. Provide supporting evidence in your answer.\n"
    "7. Suggest follow-up questions.\n"
    "8. Use professional clinical language.\n"
    "9. Be concise.\n"
    "10. If evidence is missing, set confidence below 30 and answer exactly:\n"
    '"I could not find sufficient information in the uploaded medical records."\n\n'
    "Return JSON only with this schema:\n"
    "{{\n"
    '  "answer": "Detailed clinical answer with bullet points where appropriate",\n'
    '  "summary": "1-2 sentence clinical summary of the patient context relevant to the question",\n'
    '  "evidence": ["Evidence point 1", "Evidence point 2"],\n'
    '  "confidence": 0,\n'
    '  "suggestedQuestions": ["Follow-up question 1", "Follow-up question 2", "Follow-up question 3"]\n'
    "}}\n\n"
    "Confidence guidelines:\n"
    "- Strong evidence: 85-100\n"
    "- Moderate evidence: 60-84\n"
    "- Weak evidence: below 60\n\n"
    "Context:\n"
    "{context}\n\n"
    "Question:\n"
    "{question}"
)


def _deduplicate_context_chunks(chunks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    seen: set[tuple[str, int]] = set()
    unique: List[Dict[str, Any]] = []

    for chunk in chunks:
        key = (chunk.get("fileName", ""), int(chunk.get("chunkIndex", 0)))
        if key in seen:
            continue
        seen.add(key)
        unique.append(chunk)

    return unique


def build_context(chunks: List[Dict[str, Any]], max_chars: int = MAX_CONTEXT_CHARS) -> str:
    unique_chunks = _deduplicate_context_chunks(chunks)
    parts: List[str] = []
    total_chars = 0

    for chunk in unique_chunks:
        file_name = chunk.get("fileName", "unknown")
        chunk_index = chunk.get("chunkIndex", 0)
        text = (chunk.get("text") or "").strip()
        if not text:
            continue

        entry = f"[Source: {file_name}, chunk {chunk_index}]\n{text}"
        separator_len = 2 if parts else 0

        if total_chars + separator_len + len(entry) > max_chars:
            remaining = max_chars - total_chars - separator_len
            if remaining > 0:
                parts.append(entry[:remaining])
                total_chars = max_chars
            break

        parts.append(entry)
        total_chars += separator_len + len(entry)

    return "\n\n".join(parts)


def _compute_retrieval_confidence(chunks: List[Dict[str, Any]]) -> int:
    if not chunks:
        return 0

    scores = [float(chunk.get("score", 0.0)) for chunk in chunks]
    average_score = sum(scores) / len(scores)
    return max(0, min(100, int(round(average_score * 100))))


def _parse_chat_response(raw_response: str) -> Dict[str, Any]:
    try:
        parsed = json.loads(raw_response)
    except json.JSONDecodeError:
        json_match = re.search(r"\{.*\}", raw_response, re.DOTALL)
        if not json_match:
            raise ChatGenerationError("Failed to generate response.")
        try:
            parsed = json.loads(json_match.group())
        except json.JSONDecodeError as exc:
            raise ChatGenerationError("Failed to generate response.") from exc

    answer = str(parsed.get("answer", "")).strip()
    summary = str(parsed.get("summary", "")).strip()
    evidence_raw = parsed.get("evidence", [])
    confidence_raw = parsed.get("confidence", 0)
    suggested_raw = parsed.get("suggestedQuestions", [])

    if not answer:
        raise ChatGenerationError("Failed to generate response.")

    evidence: List[str] = []
    if isinstance(evidence_raw, list):
        evidence = [str(item).strip() for item in evidence_raw if str(item).strip()]

    suggested_questions: List[str] = []
    if isinstance(suggested_raw, list):
        suggested_questions = [
            str(item).strip() for item in suggested_raw if str(item).strip()
        ][:5]

    try:
        confidence = int(round(float(confidence_raw)))
    except (TypeError, ValueError) as exc:
        raise ChatGenerationError("Failed to generate response.") from exc

    confidence = max(0, min(100, confidence))

    return {
        "answer": answer,
        "summary": summary,
        "evidence": evidence,
        "confidence": confidence,
        "suggestedQuestions": suggested_questions,
    }


def chat_with_documents(patient_id: str, question: str) -> Dict[str, Any]:
    sanitized_patient_id = patient_id.strip()
    sanitized_question = question.strip()

    logger.info(
        "Question received for patientId=%s question_length=%d",
        sanitized_patient_id,
        len(sanitized_question),
    )

    chunks = retrieve_chunks(
        patient_id=sanitized_patient_id,
        query=sanitized_question,
    )
    logger.info(
        "Chunks retrieved for patientId=%s count=%d",
        sanitized_patient_id,
        len(chunks),
    )

    if not chunks:
        raise NoDocumentsError("No medical documents found for this patient.")

    context = build_context(chunks)
    logger.info(
        "Context generated for patientId=%s context_length=%d",
        sanitized_patient_id,
        len(context),
    )

    if not context.strip():
        raise NoDocumentsError("No medical documents found for this patient.")

    retrieval_confidence = _compute_retrieval_confidence(chunks)
    prompt = COPILOT_JSON_PROMPT.format(context=context, question=sanitized_question)

    try:
        logger.info("OpenRouter request for patientId=%s", sanitized_patient_id)
        raw_response = get_llm_service().generate_completion(
            prompt,
            temperature=0.1,
            max_tokens=1536,
            response_json=True,
        )
        parsed = _parse_chat_response(raw_response)
        logger.info(
            "OpenRouter response for patientId=%s answer_length=%d confidence=%d",
            sanitized_patient_id,
            len(parsed["answer"]),
            parsed["confidence"],
        )
    except ChatGenerationError:
        raise
    except LLMAPIError as exc:
        logger.error("OpenRouter failed for patientId=%s: %s", sanitized_patient_id, exc)
        raise ChatGenerationError("Failed to generate response.") from exc
    except Exception as exc:
        logger.error("Chat generation failed for patientId=%s: %s", sanitized_patient_id, exc)
        raise ChatGenerationError("Failed to generate response.") from exc

    blended_confidence = max(
        0,
        min(100, int(round((parsed["confidence"] + retrieval_confidence) / 2))),
    )

    citations = build_citations(chunks)
    logger.info(
        "Citations generated for patientId=%s count=%d",
        sanitized_patient_id,
        len(citations),
    )

    return {
        "answer": parsed["answer"],
        "summary": parsed["summary"],
        "evidence": parsed["evidence"],
        "confidence": blended_confidence,
        "suggestedQuestions": parsed["suggestedQuestions"],
        "citations": citations,
    }
