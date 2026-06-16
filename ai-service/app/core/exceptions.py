class MediBridgeError(Exception):
    """Base exception for MediBridge AI service errors."""


class LLMConfigurationError(MediBridgeError):
    """Raised when the LLM API key is missing or invalid."""


class LLMAPIError(MediBridgeError):
    """Raised when an LLM API call fails."""


class SummaryGenerationError(MediBridgeError):
    """Raised when medical summary generation fails."""


class VectorStoreError(MediBridgeError):
    """Raised when ChromaDB operations fail."""


class EmbeddingError(MediBridgeError):
    """Raised when embedding generation fails."""


class PDFParsingError(MediBridgeError):
    """Raised when PDF text extraction fails."""


class UploadValidationError(MediBridgeError):
    """Raised when an uploaded file fails validation."""


class ChatGenerationError(MediBridgeError):
    """Raised when RAG chat response generation fails."""


class NoDocumentsError(MediBridgeError):
    """Raised when no medical documents exist for a patient."""


class RecommendationGenerationError(MediBridgeError):
    """Raised when specialist recommendation generation fails."""
