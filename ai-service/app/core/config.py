from functools import lru_cache
from pathlib import Path
from typing import Optional

from pydantic import Field, computed_field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    gemini_api_key: Optional[str] = Field(default=None, validation_alias="GEMINI_API_KEY")
    google_api_key: Optional[str] = Field(default=None, validation_alias="GOOGLE_API_KEY")
    environment: str = Field(default="development", validation_alias="ENVIRONMENT")
    debug: bool = Field(default=False, validation_alias="DEBUG")

    upload_dir: Path = Field(default=BASE_DIR / "app" / "uploads")
    chroma_dir: Path = Field(default=BASE_DIR / "chroma_db")
    chroma_collection: str = Field(default="medical_documents")
    gemini_model: str = Field(default="gemini-2.5-flash", validation_alias="GEMINI_MODEL")
    embedding_model: str = Field(default="all-MiniLM-L6-v2")
    chunk_size: int = Field(default=1000)
    chunk_overlap: int = Field(default=200)

    @computed_field
    @property
    def resolved_gemini_api_key(self) -> Optional[str]:
        key = self.gemini_api_key or self.google_api_key
        if key and key.strip():
            return key.strip()
        return None

    @model_validator(mode="after")
    def ensure_directories(self) -> "Settings":
        self.upload_dir.mkdir(parents=True, exist_ok=True)
        self.chroma_dir.mkdir(parents=True, exist_ok=True)
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()
