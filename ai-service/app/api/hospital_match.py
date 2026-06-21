from fastapi import APIRouter

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
    result = generate_hospital_match(
        patient_id=request.patient_id,
        referral_id=request.referral_id,
        origin_hospital_id=request.origin_hospital_id,
    )

    return ApiResponse(
        success=True,
        data=result,
    )