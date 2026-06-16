from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api.summary import router as summary_router
from app.api.upload import router as upload_router
from app.core.config import get_settings
from app.core.exceptions import GeminiConfigurationError
from app.core.logger import logger
from app.services.gemini_service import get_gemini_service


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    logger.info(
        "Starting MediBridge AI Service (environment=%s, debug=%s)",
        settings.environment,
        settings.debug,
    )

    try:
        get_gemini_service().validate_connection()
    except GeminiConfigurationError as exc:
        logger.error(str(exc))
        raise RuntimeError(str(exc)) from exc
    except Exception as exc:
        logger.error("Startup validation failed: %s", exc)
        raise RuntimeError(str(exc)) from exc

    yield

    logger.info("Shutting down MediBridge AI Service")


app = FastAPI(
    title="MediBridge AI Service",
    lifespan=lifespan,
)

app.include_router(upload_router, prefix="/api/ai")
app.include_router(summary_router, prefix="/api/ai")
