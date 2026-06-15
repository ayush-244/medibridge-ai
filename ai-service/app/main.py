from fastapi import FastAPI

from app.api.upload import router as upload_router
from app.api.summary import router as summary_router

app = FastAPI(
    title="MediBridge AI Service"
)

app.include_router(
    upload_router,
    prefix="/api/ai"
)

app.include_router(
    summary_router,
    prefix="/api/ai"
)