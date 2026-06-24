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
    summary: str = Field(
        default="",
        examples=["Patient has documented coronary artery disease with diabetes and hypertension."],
    )
    evidence: List[str] = Field(default_factory=list)
    confidence: int = Field(default=0, ge=0, le=100, examples=[95])
    suggestedQuestions: List[str] = Field(default_factory=list)
    citations: List[Citation] = Field(default_factory=list)


class PatientDocument(BaseModel):
    fileName: str
    uploadDate: str = ""
    chunkCount: int = 0
    patientId: str = ""


class RecommendationRequest(BaseModel):
    patient_id: str = Field(
        ...,
        min_length=1,
        max_length=128,
        examples=["PATIENT001"],
        description="Unique patient identifier used for document isolation.",
    )


class ReferralContextRequest(BaseModel):
    patient_id: str = Field(
        ...,
        min_length=1,
        max_length=128,
        description="Referral ID used as ChromaDB patient scope.",
    )
    patientName: Optional[str] = Field(default=None, description="Patient name from referral.")
    age: Optional[int] = Field(default=None, description="Patient age from referral.")
    condition: Optional[str] = Field(default=None, description="Clinical condition from referral.")


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
    source: Optional[str] = Field(
        default=None,
        description="Source of the recommendation: 'documents' or 'referral'.",
    )

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

    origin_hospital_id: Optional[str] = Field(
        default=None,
        examples=["6a26b08bceaee55f6b61bd97"],
        description="Pre-referral origin hospital ID (used instead of referral_id for pre-referral flow).",
    )


class PatientSnapshotRequest(BaseModel):
    patient_id: str = Field(
        ...,
        min_length=1,
        max_length=128,
        examples=["PATIENT002"],
    )


class ClinicalIntelligenceRequest(BaseModel):
    patient_id: str = Field(
        ...,
        min_length=1,
        max_length=128,
        examples=["PATIENT002"],
    )


class PatientSnapshotResponse(BaseModel):
    primaryDiagnosis: str = Field(..., examples=["Coronary Artery Disease"])
    riskLevel: str = Field(..., examples=["HIGH"])
    medications: List[str] = Field(default_factory=list)
    recommendedSpecialist: str = Field(..., examples=["Cardiology"])
    urgency: str = Field(..., examples=["Urgent"])
    transferRecommendation: str = Field(
        ...,
        examples=["Transfer within 2 hours"],
    )
    confidence: int = Field(..., ge=0, le=100, examples=[95])
    aiFindings: List[str] = Field(default_factory=list)
    evidence: List[str] = Field(default_factory=list)
    citations: List[Citation] = Field(default_factory=list)


class ClinicalIntelligenceResponse(PatientSnapshotResponse):
    pass


class ReferralAutofillData(BaseModel):
    patientName: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    diagnosis: Optional[str] = None
    conditionSummary: Optional[str] = None
    priority: Optional[str] = None
    requiredSpecialty: Optional[str] = None


class ReassignDocumentsRequest(BaseModel):
    from_patient_id: str = Field(
        ...,
        min_length=1,
        max_length=128,
        description="Current patient ID (temporary UUID) to reassign from.",
    )
    to_patient_id: str = Field(
        ...,
        min_length=1,
        max_length=128,
        description="Target patient ID (referral._id) to reassign to.",
    )


class ReassignDocumentsData(BaseModel):
    documents_reassigned: int = 0


class ApiResponse(BaseModel):
    success: bool
    data: Optional[
        Union[
            SummaryData,
            UploadData,
            ChatResponse,
            RecommendationResponse,
            HospitalMatchData,
            PatientSnapshotResponse,
            ClinicalIntelligenceResponse,
            ReferralAutofillData,
            List[PatientDocument],
            ReassignDocumentsData,
            Dict[str, Any],
        ]
    ] = None
    message: Optional[str] = None
