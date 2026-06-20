from fastapi import APIRouter

from app.core.exceptions import NoDocumentsError, RecommendationGenerationError
from app.core.logger import logger
from app.models.schemas import ApiResponse, PatientSnapshotRequest, PatientSnapshotResponse
from app.services.clinical_intelligence_service import generate_clinical_intelligence

router = APIRouter(tags=["Patient Snapshot"])


@router.post(
    "/patient-snapshot",
    response_model=ApiResponse,
    summary="Generate AI patient snapshot",
    description=(
        "Automatically generate a comprehensive patient snapshot including "
        "diagnosis, risk, medications, specialist, urgency, and confidence."
    ),
)
def patient_snapshot_endpoint(request: PatientSnapshotRequest) -> ApiResponse:
    try:
        result = generate_clinical_intelligence(patient_id=request.patient_id.strip())
        return ApiResponse(
            success=True,
            data=PatientSnapshotResponse(
                primaryDiagnosis=result["primaryDiagnosis"],
                riskLevel=result["riskLevel"],
                medications=result["medications"],
                recommendedSpecialist=result["recommendedSpecialist"],
                urgency=result["urgency"],
                transferRecommendation=result["transferRecommendation"],
                confidence=result["confidence"],
                aiFindings=result["aiFindings"],
                evidence=result["evidence"],
                citations=result.get("citations", []),
            ),
        )
    except NoDocumentsError as exc:
        logger.warning(
            "No documents for snapshot patientId=%s",
            request.patient_id.strip(),
        )
        return ApiResponse(success=False, message=str(exc))
    except RecommendationGenerationError as exc:
        logger.error(
            "Snapshot generation failed for patientId=%s",
            request.patient_id.strip(),
        )
        return ApiResponse(success=False, message=str(exc))
    except Exception as exc:
        logger.exception(
            "Unexpected snapshot error for patientId=%s: %s",
            request.patient_id,
            exc,
        )
        return ApiResponse(
            success=False,
            message="Failed to generate patient snapshot.",
        )
