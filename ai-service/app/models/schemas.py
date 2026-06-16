from typing import Any, Dict, List, Optional, Union

from pydantic import BaseModel, Field


class SummaryRequest(BaseModel):
    text: str = Field(..., min_length=1)


class SummaryData(BaseModel):
    summary: str = ""
    diagnosis: str = ""
    riskFactors: List[str] = Field(default_factory=list)
    medications: List[str] = Field(default_factory=list)
    recommendations: List[str] = Field(default_factory=list)


class UploadData(BaseModel):
    filename: str
    chunks_stored: int = 0
    patient_id: Optional[str] = None
    uploaded_by: Optional[str] = None


class ApiResponse(BaseModel):
    success: bool
    data: Optional[Union[SummaryData, UploadData, Dict[str, Any]]] = None
    message: Optional[str] = None
