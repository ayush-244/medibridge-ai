from fastapi import APIRouter

from app.core.logger import logger
from app.models.schemas import SummaryRequest, SummaryResponse
from app.services.summary_service import generate_medical_summary

router = APIRouter()


@router.post("/summarize", response_model=SummaryResponse)
def summarize_report(request: SummaryRequest) -> SummaryResponse:
    try:
        result = generate_medical_summary(request.text)
        return SummaryResponse(
            success=True,
            summary=result["summary"],
            diagnosis=result["diagnosis"],
            riskFactors=result["riskFactors"],
            medications=result["medications"],
            recommendations=result["recommendations"],
        )
    except Exception as exc:
        logger.exception("Summary generation failed: %s", exc)
        return SummaryResponse(
            success=False,
            message="Failed to generate summary",
        )
