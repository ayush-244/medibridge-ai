from fastapi import APIRouter

from app.core.exceptions import NoDocumentsError, RecommendationGenerationError
from app.core.logger import logger
from app.models.schemas import (
    ApiResponse,
    ReferralAutofillData,
    ReferralContextRequest,
)
from app.services.extraction_service import extract_referral_data

router = APIRouter(tags=["AI Extraction"])


@router.post(
    "/extract-referral",
    response_model=ApiResponse,
    summary="Extract structured referral data from clinical documents",
    description=(
        "Retrieve uploaded clinical document chunks for a patient and use "
        "the LLM to extract structured referral information (patient name, "
        "age, gender, diagnosis, condition summary, priority, required "
        "specialty). Never hallucinates missing values."
    ),
)
def extract_referral_endpoint(request: ReferralContextRequest) -> ApiResponse:
    try:
        result = extract_referral_data(
            patient_id=request.patient_id.strip(),
        )
        return ApiResponse(
            success=True,
            data=ReferralAutofillData(
                patientName=result.get("patientName"),
                age=result.get("age"),
                gender=result.get("gender"),
                diagnosis=result.get("diagnosis"),
                conditionSummary=result.get("conditionSummary"),
                priority=result.get("priority"),
                requiredSpecialty=result.get("requiredSpecialty"),
            ),
        )
    except NoDocumentsError as exc:
        logger.warning(
            "No documents for extraction patientId=%s",
            request.patient_id.strip(),
        )
        return ApiResponse(success=False, message=str(exc))
    except RecommendationGenerationError as exc:
        logger.error(
            "Extraction generation failed for patientId=%s",
            request.patient_id.strip(),
        )
        return ApiResponse(success=False, message=str(exc))
    except Exception as exc:
        logger.exception(
            "Unexpected extraction error for patientId=%s: %s",
            request.patient_id,
            exc,
        )
        return ApiResponse(
            success=False,
            message="Unable to extract patient information from this document.",
        )
