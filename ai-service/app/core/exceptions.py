class MediBridgeError(Exception):
    """Base exception for MediBridge AI service errors."""


class GeminiConfigurationError(MediBridgeError):
    """Raised when the Gemini API key is missing or invalid."""


class GeminiAPIError(MediBridgeError):
    """Raised when a Gemini API call fails."""


class SummaryGenerationError(MediBridgeError):
    """Raised when medical summary generation fails."""


class VectorStoreError(MediBridgeError):
    """Raised when ChromaDB operations fail."""


class EmbeddingError(MediBridgeError):
    """Raised when embedding generation fails."""
