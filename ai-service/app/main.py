from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.api.chat import router as chat_router
from app.api.recommendation import router as recommendation_router
from app.api.summary import router as summary_router
from app.api.upload import router as upload_router
from app.core.config import get_settings
from app.core.exceptions import LLMConfigurationError, MediBridgeError, VectorStoreError
from app.core.logger import logger
from app.models.schemas import ApiResponse
from app.services.llm_service import get_llm_service
from app.services.vector_service import validate_chroma_connection
from app.api.hospital_match import router as hospital_match_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    logger.info(
        "Starting MediBridge AI Service (environment=%s, debug=%s, provider=%s)",
        settings.environment,
        settings.debug,
        settings.llm_provider,
    )

    if not settings.upload_dir.exists():
        raise RuntimeError(f"Upload directory is not accessible: {settings.upload_dir}")

    try:
        get_llm_service().validate_connection()
    except LLMConfigurationError as exc:
        logger.error(str(exc))
        raise RuntimeError(str(exc)) from exc
    except Exception as exc:
        logger.error("LLM startup validation failed: %s", exc)
        raise RuntimeError(str(exc)) from exc

    try:
        validate_chroma_connection()
    except VectorStoreError as exc:
        logger.error(str(exc))
        raise RuntimeError(str(exc)) from exc

    yield

    logger.info("Shutting down MediBridge AI Service")


app = FastAPI(
    title="MediBridge AI Service",
    lifespan=lifespan,
)


@app.exception_handler(MediBridgeError)
async def medibridge_exception_handler(
    _request: Request,
    exc: MediBridgeError,
) -> JSONResponse:
    logger.error("Domain error: %s", exc)
    return JSONResponse(
        status_code=400,
        content=ApiResponse(success=False, message=str(exc)).model_dump(),
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(
    _request: Request,
    exc: Exception,
) -> JSONResponse:
    logger.exception("Unhandled server error: %s", exc)
    return JSONResponse(
        status_code=500,
        content=ApiResponse(success=False, message="Internal server error").model_dump(),
    )


app.include_router(upload_router, prefix="/api/ai")
app.include_router(summary_router, prefix="/api/ai")
app.include_router(chat_router, prefix="/api/ai")
app.include_router(recommendation_router, prefix="/api/ai")
app.include_router(hospital_match_router, prefix="/api/ai")
