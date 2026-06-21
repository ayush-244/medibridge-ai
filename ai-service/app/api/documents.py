from fastapi import APIRouter

from app.core.exceptions import VectorStoreError
from app.core.logger import logger
from app.models.schemas import (
    ApiResponse,
    PatientDocument,
    ReassignDocumentsData,
    ReassignDocumentsRequest,
)
from app.services.vector_service import (
    list_patient_documents,
    reassign_patient_documents,
)

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


@router.post(
    "/documents/re-scope",
    response_model=ApiResponse,
    summary="Reassign documents from one patient scope to another",
    description=(
        "Moves all ChromaDB document chunks from a temporary patient ID "
        "(e.g., client-generated UUID) to a permanent referral ID after "
        "the referral is created."
    ),
)
def re_scope_documents(request: ReassignDocumentsRequest) -> ApiResponse:
    from_pid = request.from_patient_id.strip()
    to_pid = request.to_patient_id.strip()

    if not from_pid or not to_pid:
        return ApiResponse(success=False, message="Both from_patient_id and to_patient_id are required.")

    if from_pid == to_pid:
        return ApiResponse(
            success=False,
            message="from_patient_id and to_patient_id must differ.",
        )

    try:
        count = reassign_patient_documents(
            from_patient_id=from_pid,
            to_patient_id=to_pid,
        )
        return ApiResponse(
            success=True,
            data=ReassignDocumentsData(documents_reassigned=count),
        )
    except VectorStoreError as exc:
        logger.error(
            "Re-scope failed from_patient_id=%s to_patient_id=%s: %s",
            from_pid,
            to_pid,
            exc,
        )
        return ApiResponse(success=False, message=str(exc))
    except Exception as exc:
        logger.exception(
            "Unexpected re-scope error from_patient_id=%s to_patient_id=%s: %s",
            from_pid,
            to_pid,
            exc,
        )
        return ApiResponse(success=False, message="Failed to reassign documents.")
