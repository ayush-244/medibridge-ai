from fastapi import APIRouter
from pydantic import BaseModel

from app.services.summary_service import (
    generate_medical_summary
)

router = APIRouter()


class SummaryRequest(BaseModel):
    text: str


@router.post("/summarize")
def summarize_report(
    request: SummaryRequest
):

    summary = generate_medical_summary(
        request.text
    )

    return {
        "summary": summary
    }