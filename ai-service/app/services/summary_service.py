from typing import Any, Dict

from app.core.exceptions import SummaryGenerationError
from app.core.logger import logger
from app.services.llm_service import get_llm_service


def generate_medical_summary(text: str) -> Dict[str, Any]:
    if not text or not text.strip():
        raise SummaryGenerationError("Report text is empty")

    try:
        logger.info("Generating medical summary")
        result = get_llm_service().generate_summary(text)
        logger.info("Medical summary generated successfully")
        return result
    except SummaryGenerationError:
        raise
    except Exception as exc:
        logger.error("Summary generation failed: %s", exc)
        raise SummaryGenerationError("Failed to generate summary") from exc
