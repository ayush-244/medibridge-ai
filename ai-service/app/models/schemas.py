from typing import List, Optional

from pydantic import BaseModel, Field


class SummaryRequest(BaseModel):
    text: str = Field(..., min_length=1)


class SummaryResponse(BaseModel):
    success: bool
    summary: Optional[str] = None
    diagnosis: Optional[str] = None
    riskFactors: List[str] = Field(default_factory=list)
    medications: List[str] = Field(default_factory=list)
    recommendations: List[str] = Field(default_factory=list)
    message: Optional[str] = None


class UploadResponse(BaseModel):
    success: bool
    filename: Optional[str] = None
    chunks_stored: int = 0
    patient_id: Optional[str] = None
    message: Optional[str] = None
