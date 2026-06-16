from typing import List, Optional

from app.core.config import Settings, get_settings


def chunk_text(
    text: str,
    chunk_size: Optional[int] = None,
    overlap: Optional[int] = None,
    settings: Optional[Settings] = None,
) -> List[str]:
    config = settings or get_settings()
    size = chunk_size or config.chunk_size
    overlap_size = overlap or config.chunk_overlap

    if not text or not text.strip():
        return []

    if size <= 0:
        return [text]

    if overlap_size >= size:
        overlap_size = 0

    chunks: List[str] = []
    start = 0
    text_length = len(text)

    while start < text_length:
        end = min(start + size, text_length)
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)

        if end >= text_length:
            break

        start = end - overlap_size

    return chunks
