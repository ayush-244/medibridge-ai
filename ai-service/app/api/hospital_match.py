import traceback

from fastapi import APIRouter

from app.core.logger import logger
from app.models.schemas import (
    ApiResponse,
    HospitalMatchRequest,
)

from app.services.hospital_matching_service import (
    generate_hospital_match,
)

router = APIRouter(tags=["Hospital Matching"])


@router.post("/hospital-match")
def hospital_match(
    request: HospitalMatchRequest,
):
    logger.info("[diag] /hospital-match called: patient_id=%s referral_id=%s origin_hospital_id=%s", request.patient_id, request.referral_id, request.origin_hospital_id)
    try:
        result = generate_hospital_match(
            patient_id=request.patient_id,
            referral_id=request.referral_id,
            origin_hospital_id=request.origin_hospital_id,
        )
        logger.info("[diag] /hospital-match succeeded: specialist=%s hospitals=%d", result.get("specialist"), len(result.get("recommendedHospitals", [])))
        return ApiResponse(
            success=True,
            data=result,
        )
    except Exception as e:
        logger.error("[diag] /hospital-match EXCEPTION: %s: %s", type(e).__name__, str(e))
        logger.error("[diag] traceback:\n%s", traceback.format_exc())
        raise