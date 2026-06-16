from fastapi import APIRouter

from app.core.exceptions import NoDocumentsError, RecommendationGenerationError
from app.core.logger import logger
from app.models.schemas import (
    ApiResponse,
    Citation,
    RecommendationRequest,
    RecommendationResponse,
)
from app.services.recommendation_service import recommend_specialist

router = APIRouter(tags=["AI Recommendations"])


@router.post(
    "/recommend-specialist",
    response_model=ApiResponse,
    summary="Recommend a specialist based on patient records",
    description=(
        "Retrieve relevant clinical evidence for a patient and recommend "
        "the most appropriate MediBridge specialization with confidence scoring "
        "and supporting citations."
    ),
)
def recommend_specialist_endpoint(request: RecommendationRequest) -> ApiResponse:
    try:
        result = recommend_specialist(patient_id=request.patient_id.strip())
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
            ),
        )
    except NoDocumentsError as exc:
        logger.warning(
            "No documents for recommendation patientId=%s",
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
