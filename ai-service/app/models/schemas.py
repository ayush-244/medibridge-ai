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


class Citation(BaseModel):
    fileName: str = Field(..., examples=["report.pdf"])
    chunkIndex: int = Field(..., ge=0, examples=[2])


class ChatRequest(BaseModel):
    patient_id: str = Field(
        ...,
        min_length=1,
        max_length=128,
        examples=["PATIENT001"],
        description="Unique patient identifier used for document isolation.",
    )
    question: str = Field(
        ...,
        min_length=1,
        max_length=2000,
        examples=["What medications is the patient taking?"],
        description="Clinical question to answer from uploaded patient records.",
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "patient_id": "PATIENT001",
                    "question": "What is the primary diagnosis?",
                },
                {
                    "patient_id": "PATIENT001",
                    "question": "What medications is the patient taking?",
                },
                {
                    "patient_id": "PATIENT001",
                    "question": "What are the patient's risk factors?",
                },
            ]
        }
    }


class ChatResponse(BaseModel):
    answer: str = Field(
        ...,
        examples=["Patient is taking Aspirin and Atorvastatin."],
    )
    citations: List[Citation] = Field(default_factory=list)


class RecommendationRequest(BaseModel):
    patient_id: str = Field(
        ...,
        min_length=1,
        max_length=128,
        examples=["PATIENT001"],
        description="Unique patient identifier used for document isolation.",
    )


class RecommendationResponse(BaseModel):
    specialist: str = Field(..., examples=["Cardiology"])
    recommendedSpecialist: str = Field(..., examples=["Cardiology"])
    confidence: int = Field(..., ge=0, le=100, examples=[94])
    reason: str = Field(
        ...,
        examples=[
            "Patient has coronary artery disease, chest pain, hypertension and "
            "diabetes indicating need for cardiac specialist evaluation."
        ],
    )
    supportingEvidence: List[Citation] = Field(default_factory=list)

class RecommendedHospital(BaseModel):
    hospitalId: str
    hospitalName: str

    doctorId: str
    doctorName: str

    specialist: str

    availableBeds: int

    distanceKm: float

    score: int

    breakdown: Dict[str, float]


class HospitalMatchData(BaseModel):
    specialist: str
    recommendedHospitals: List[RecommendedHospital] = Field(
        default_factory=list
    )


class HospitalMatchRequest(BaseModel):
    patient_id: str = Field(
        ...,
        min_length=1,
        max_length=128,
        examples=["PATIENT001"],
    )

    referral_id: str = Field(
        ...,
        min_length=1,
        examples=["6a26b08bceaee55f6b61bd97"],
    )

class ApiResponse(BaseModel):
    success: bool
    data: Optional[
        Union[SummaryData, UploadData, ChatResponse, RecommendationResponse,HospitalMatchData, Dict[str, Any]]
    ] = None
    message: Optional[str] = None
