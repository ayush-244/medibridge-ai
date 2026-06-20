from fastapi import APIRouter

from app.core.exceptions import NoDocumentsError, RecommendationGenerationError
from app.core.logger import logger
from app.models.schemas import ApiResponse, ClinicalIntelligenceRequest, ClinicalIntelligenceResponse
from app.services.clinical_intelligence_service import generate_clinical_intelligence

router = APIRouter(tags=["Clinical Intelligence"])


@router.post(
    "/clinical-intelligence",
    response_model=ApiResponse,
    summary="Generate clinical intelligence for a patient",
    description=(
        "Proactively analyze patient records to determine risk level, urgency, "
        "specialist recommendation, and transfer requirements."
    ),
)
def clinical_intelligence_endpoint(request: ClinicalIntelligenceRequest) -> ApiResponse:
    try:
        result = generate_clinical_intelligence(patient_id=request.patient_id.strip())
        return ApiResponse(
            success=True,
            data=ClinicalIntelligenceResponse(**result),
        )
    except NoDocumentsError as exc:
        logger.warning(
            "No documents for clinical intelligence patientId=%s",
            request.patient_id.strip(),
        )
        return ApiResponse(success=False, message=str(exc))
    except RecommendationGenerationError as exc:
        logger.error(
            "Clinical intelligence failed for patientId=%s",
            request.patient_id.strip(),
        )
        return ApiResponse(success=False, message=str(exc))
    except Exception as exc:
        logger.exception(
            "Unexpected clinical intelligence error for patientId=%s: %s",
            request.patient_id,
            exc,
        )
        return ApiResponse(
            success=False,
            message="Failed to generate clinical intelligence.",
        )
