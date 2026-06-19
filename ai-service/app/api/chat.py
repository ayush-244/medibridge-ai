from fastapi import APIRouter

from app.core.exceptions import ChatGenerationError, NoDocumentsError
from app.core.logger import logger
from app.models.schemas import ApiResponse, ChatRequest, ChatResponse, Citation
from app.services.chat_service import chat_with_documents

router = APIRouter(tags=["AI Chat"])


@router.post(
    "/chat",
    response_model=ApiResponse,
    summary="Ask a clinical question about patient records",
    description=(
        "Retrieve relevant medical document chunks for a patient and generate "
        "an evidence-backed answer with citations. Answers are grounded only "
        "in uploaded records."
    ),
)
def chat(request: ChatRequest) -> ApiResponse:
    try:
        result = chat_with_documents(
            patient_id=request.patient_id.strip(),
            question=request.question.strip(),
        )
        return ApiResponse(
            success=True,
            data=ChatResponse(
                answer=result["answer"],
                summary=result.get("summary", ""),
                evidence=result.get("evidence", []),
                confidence=result.get("confidence", 0),
                suggestedQuestions=result.get("suggestedQuestions", []),
                citations=[Citation(**citation) for citation in result["citations"]],
            ),
        )
    except NoDocumentsError as exc:
        logger.warning(
            "No documents for chat patientId=%s",
            request.patient_id.strip(),
        )
        return ApiResponse(success=False, message=str(exc))
    except ChatGenerationError as exc:
        logger.error("Chat generation failed for patientId=%s", request.patient_id.strip())
        return ApiResponse(success=False, message=str(exc))
    except Exception as exc:
        logger.exception("Unexpected chat error for patientId=%s: %s", request.patient_id, exc)
        return ApiResponse(success=False, message="Failed to generate response.")
