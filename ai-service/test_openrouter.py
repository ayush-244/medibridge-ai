"""Manual OpenRouter connectivity check. Requires OPENROUTER_API_KEY in .env."""

from app.core.logger import logger
from app.services.llm_service import get_llm_service


def main() -> None:
    service = get_llm_service()
    service.validate_connection()
    response = service.generate_completion("Say hello in one sentence.", max_tokens=32)
    logger.info("OpenRouter test response: %s", response)


if __name__ == "__main__":
    main()
