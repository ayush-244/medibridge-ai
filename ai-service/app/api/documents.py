from fastapi import APIRouter

from app.core.exceptions import VectorStoreError
from app.core.logger import logger
from app.models.schemas import ApiResponse, PatientDocument
from app.services.vector_service import list_patient_documents

router = APIRouter(tags=["AI Documents"])


@router.get(
    "/documents/{patient_id}",
    response_model=ApiResponse,
    summary="List uploaded documents for a patient",
)
def get_patient_documents(patient_id: str) -> ApiResponse:
    try:
        documents = list_patient_documents(patient_id=patient_id.strip())
        return ApiResponse(
            success=True,
            data=[
                PatientDocument(
                    fileName=doc["fileName"],
                    uploadDate=doc.get("uploadDate", ""),
                    chunkCount=doc.get("chunkCount", 0),
                    patientId=doc.get("patientId", patient_id.strip()),
                )
                for doc in documents
            ],
        )
    except VectorStoreError as exc:
        logger.error("Document list failed for patientId=%s: %s", patient_id, exc)
        return ApiResponse(success=False, message=str(exc))
    except Exception as exc:
        logger.exception(
            "Unexpected document list error for patientId=%s: %s",
            patient_id,
            exc,
        )
        return ApiResponse(success=False, message="Failed to list documents.")
