from fastapi import APIRouter

from app.core.exceptions import NoDocumentsError, RecommendationGenerationError
from app.core.logger import logger
from app.models.schemas import (
    ApiResponse,
    Citation,
    ReferralContextRequest,
    RecommendationResponse,
)
from app.services.recommendation_service import recommend_specialist

router = APIRouter(tags=["AI Recommendations"])


@router.post(
    "/recommend-specialist",
    response_model=ApiResponse,
    summary="Recommend a specialist based on patient records or referral context",
    description=(
        "Retrieve relevant clinical evidence for a patient and recommend "
        "the most appropriate MediBridge specialization with confidence scoring "
        "and supporting citations. Falls back to referral context when no "
        "documents exist in ChromaDB."
    ),
)
def recommend_specialist_endpoint(request: ReferralContextRequest) -> ApiResponse:
    # Build referral context for fallback if clinical fields are provided
    referral_context = None
    if request.patientName or request.condition:
        referral_context = {
            "patientName": request.patientName or "Unknown",
            "age": request.age or 0,
            "condition": request.condition or "",
        }

    try:
        result = recommend_specialist(
            patient_id=request.patient_id.strip(),
            referral_context=referral_context,
        )
        return ApiResponse(
            success=True,
            data=RecommendationResponse(
                specialist=result["specialist"],
                recommendedSpecialist=result["recommendedSpecialist"],
                confidence=result["confidence"],
                reason=result["reason"],
                supportingEvidence=[
                    Citation(**citation) for citation in result["supportingEvidence"]
                ],
                source=result.get("source"),
            ),
        )
    except NoDocumentsError as exc:
        logger.warning(
            "No documents and no referral context for patientId=%s",
            request.patient_id.strip(),
        )
        return ApiResponse(success=False, message=str(exc))
    except RecommendationGenerationError as exc:
        logger.error(
            "Recommendation generation failed for patientId=%s",
            request.patient_id.strip(),
        )
        return ApiResponse(success=False, message=str(exc))
    except Exception as exc:
        logger.exception(
            "Unexpected recommendation error for patientId=%s: %s",
            request.patient_id,
            exc,
        )
        return ApiResponse(
            success=False,
            message="Failed to generate specialist recommendation.",
        )
