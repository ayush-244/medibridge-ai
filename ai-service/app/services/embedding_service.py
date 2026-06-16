from typing import List, Optional

from sentence_transformers import SentenceTransformer

from app.core.config import Settings, get_settings
from app.core.exceptions import EmbeddingError
from app.core.logger import logger

_model: Optional[SentenceTransformer] = None
_model_name: Optional[str] = None


def _get_model(settings: Settings) -> SentenceTransformer:
    global _model, _model_name

    if _model is None or _model_name != settings.embedding_model:
        logger.info("Loading embedding model: %s", settings.embedding_model)
        _model = SentenceTransformer(settings.embedding_model)
        _model_name = settings.embedding_model
        logger.info("Embedding model loaded successfully")

    return _model


def generate_embeddings(
    chunks: List[str],
    settings: Optional[Settings] = None,
) -> List[List[float]]:
    if not chunks:
        return []

    config = settings or get_settings()

    try:
        model = _get_model(config)
        embeddings = model.encode(chunks, show_progress_bar=False)
        return [embedding.tolist() for embedding in embeddings]
    except Exception as exc:
        logger.error("Embedding generation failed: %s", exc)
        raise EmbeddingError(f"Failed to generate embeddings: {exc}") from exc
