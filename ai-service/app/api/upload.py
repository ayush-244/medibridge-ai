from fastapi import APIRouter, File, Form, UploadFile

from app.core.config import get_settings
from app.core.exceptions import (
    EmbeddingError,
    PDFParsingError,
    UploadValidationError,
    VectorStoreError,
)
from app.core.logger import logger
from app.models.schemas import ApiResponse, UploadData
from app.services.chunk_service import chunk_text
from app.services.embedding_service import generate_embeddings
from app.services.pdf_service import (
    build_stored_filename,
    extract_text_from_pdf,
    sanitize_filename,
    validate_pdf_upload,
)
from app.services.vector_service import store_document_chunks

router = APIRouter()


@router.post("/upload", response_model=ApiResponse)
async def upload_pdf(
    file: UploadFile = File(...),
    patient_id: str = Form(default=""),
    uploaded_by: str = Form(default=""),
) -> ApiResponse:
    settings = get_settings()
    original_filename = sanitize_filename(file.filename or "upload.pdf")
    stored_filename = build_stored_filename(original_filename)
    file_path = settings.upload_dir / stored_filename

    try:
        content = await file.read()

        validate_pdf_upload(
            content=content,
            filename=original_filename,
            content_type=file.content_type,
            max_size_bytes=settings.max_upload_size_bytes,
        )

        file_path.write_bytes(content)

        logger.info(
            "PDF uploaded: filename=%s patient_id=%s uploaded_by=%s",
            stored_filename,
            patient_id,
            uploaded_by,
        )

        extracted_text = extract_text_from_pdf(str(file_path))
        chunks = chunk_text(extracted_text)
        embeddings = generate_embeddings(chunks)
        chunks_stored = store_document_chunks(
            chunks=chunks,
            embeddings=embeddings,
            file_name=stored_filename,
            patient_id=patient_id or None,
            uploaded_by=uploaded_by or None,
        )

        logger.info(
            "Upload pipeline complete: filename=%s chunks_stored=%d",
            stored_filename,
            chunks_stored,
        )

        return ApiResponse(
            success=True,
            data=UploadData(
                filename=stored_filename,
                chunks_stored=chunks_stored,
                patient_id=patient_id or None,
                uploaded_by=uploaded_by or None,
            ),
        )
    except UploadValidationError as exc:
        logger.warning("Upload validation failed for %s: %s", original_filename, exc)
        return ApiResponse(success=False, message=str(exc))
    except PDFParsingError as exc:
        logger.error("PDF parsing failed for %s: %s", original_filename, exc)
        return ApiResponse(success=False, message="Failed to extract text from PDF")
    except (EmbeddingError, VectorStoreError) as exc:
        logger.error("Upload pipeline storage failed for %s: %s", original_filename, exc)
        return ApiResponse(success=False, message="Failed to process uploaded PDF")
    except Exception as exc:
        logger.exception("Upload pipeline failed for %s: %s", original_filename, exc)
        return ApiResponse(success=False, message="Failed to process uploaded PDF")
