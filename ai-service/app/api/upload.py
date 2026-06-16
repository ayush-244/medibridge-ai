from fastapi import APIRouter, File, Form, UploadFile

from app.core.config import get_settings
from app.core.logger import logger
from app.models.schemas import UploadResponse
from app.services.chunk_service import chunk_text
from app.services.embedding_service import generate_embeddings
from app.services.pdf_service import extract_text_from_pdf
from app.services.vector_service import store_document_chunks

router = APIRouter()


@router.post("/upload", response_model=UploadResponse)
async def upload_pdf(
    file: UploadFile = File(...),
    patient_id: str = Form(default=""),
) -> UploadResponse:
    settings = get_settings()
    filename = file.filename or "upload.pdf"
    file_path = settings.upload_dir / filename

    try:
        content = await file.read()
        file_path.write_bytes(content)

        logger.info("PDF uploaded: filename=%s patient_id=%s", filename, patient_id)

        extracted_text = extract_text_from_pdf(str(file_path))
        chunks = chunk_text(extracted_text)
        embeddings = generate_embeddings(chunks)
        chunks_stored = store_document_chunks(
            chunks=chunks,
            embeddings=embeddings,
            file_name=filename,
            patient_id=patient_id or None,
        )

        logger.info(
            "Upload pipeline complete: filename=%s chunks_stored=%d",
            filename,
            chunks_stored,
        )

        return UploadResponse(
            success=True,
            filename=filename,
            chunks_stored=chunks_stored,
            patient_id=patient_id or None,
        )
    except Exception as exc:
        logger.error("Upload pipeline failed for %s: %s", filename, exc)
        return UploadResponse(
            success=False,
            message="Failed to process uploaded PDF",
        )
