import re
import uuid
from pathlib import Path
from typing import Optional

from pypdf import PdfReader
from pypdf.errors import PdfReadError

from app.core.exceptions import PDFParsingError, UploadValidationError

_PDF_MAGIC = b"%PDF"
_SAFE_FILENAME_PATTERN = re.compile(r"[^\w.\-]")


def sanitize_filename(filename: str) -> str:
    safe_name = Path(filename).name
    safe_name = _SAFE_FILENAME_PATTERN.sub("_", safe_name).strip("._")
    return safe_name or "upload.pdf"


def validate_pdf_upload(
    content: bytes,
    filename: str,
    content_type: Optional[str] = None,
    max_size_bytes: int = 10 * 1024 * 1024,
) -> None:
    if not content:
        raise UploadValidationError("Uploaded file is empty")

    if len(content) > max_size_bytes:
        raise UploadValidationError("File exceeds maximum upload size")

    if not content.startswith(_PDF_MAGIC):
        raise UploadValidationError("File is not a valid PDF")

    safe_name = sanitize_filename(filename)
    if not safe_name.lower().endswith(".pdf"):
        raise UploadValidationError("Only PDF files are allowed")

    if content_type and content_type not in ("application/pdf", "application/x-pdf"):
        raise UploadValidationError("Only PDF files are allowed")


def extract_text_from_pdf(pdf_path: str) -> str:
    try:
        reader = PdfReader(pdf_path)

        if reader.is_encrypted:
            raise PDFParsingError("Encrypted PDFs are not supported")

        text_parts: list[str] = []
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text)

        extracted = "\n".join(text_parts).strip()
        if not extracted:
            raise PDFParsingError("No extractable text found in PDF")

        return extracted
    except PDFParsingError:
        raise
    except PdfReadError as exc:
        raise PDFParsingError(f"Failed to read PDF: {exc}") from exc
    except Exception as exc:
        raise PDFParsingError(f"Failed to parse PDF: {exc}") from exc


def build_stored_filename(original_filename: str) -> str:
    safe_name = sanitize_filename(original_filename)
    return f"{uuid.uuid4().hex}_{safe_name}"
