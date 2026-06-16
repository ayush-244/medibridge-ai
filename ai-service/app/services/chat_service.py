from typing import Any, Dict, List

from app.core.exceptions import ChatGenerationError, LLMAPIError, NoDocumentsError
from app.core.logger import logger
from app.services.citation_service import build_citations
from app.services.llm_service import get_llm_service
from app.services.retriever_service import retrieve_chunks

MAX_CONTEXT_CHARS = 6000

CLINICAL_PROMPT = (
    "You are MediBridge Clinical Assistant.\n\n"
    "You must answer ONLY from the supplied medical records.\n\n"
    'If the answer cannot be found in the supplied records, respond exactly:\n\n'
    '"I could not find sufficient information in the uploaded medical records."\n\n'
    "Do not guess.\n"
    "Do not hallucinate.\n"
    "Do not create facts.\n\n"
    "Provide concise physician-focused answers.\n\n"
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

    prompt = CLINICAL_PROMPT.format(context=context, question=sanitized_question)

    try:
        logger.info("OpenRouter request for patientId=%s", sanitized_patient_id)
        answer = get_llm_service().generate_completion(
            prompt,
            temperature=0.1,
            max_tokens=1024,
        )
        logger.info(
            "OpenRouter response for patientId=%s answer_length=%d",
            sanitized_patient_id,
            len(answer),
        )
    except LLMAPIError as exc:
        logger.error("OpenRouter failed for patientId=%s: %s", sanitized_patient_id, exc)
        raise ChatGenerationError("Failed to generate response.") from exc
    except Exception as exc:
        logger.error("Chat generation failed for patientId=%s: %s", sanitized_patient_id, exc)
        raise ChatGenerationError("Failed to generate response.") from exc

    citations = build_citations(chunks)
    logger.info(
        "Citations generated for patientId=%s count=%d",
        sanitized_patient_id,
        len(citations),
    )

    return {
        "answer": answer,
        "citations": citations,
    }
