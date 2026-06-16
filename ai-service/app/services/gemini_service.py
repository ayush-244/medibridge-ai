import json
from typing import Any, Dict, List, Optional

from google import genai
from google.genai import types
from google.genai.errors import ClientError

from app.core.config import Settings, get_settings
from app.core.exceptions import GeminiAPIError, GeminiConfigurationError
from app.core.logger import logger

MEDICAL_SUMMARY_SCHEMA: Dict[str, Any] = {
    "type": "object",
    "properties": {
        "summary": {"type": "string"},
        "diagnosis": {"type": "string"},
        "riskFactors": {"type": "array", "items": {"type": "string"}},
        "medications": {"type": "array", "items": {"type": "string"}},
        "recommendations": {"type": "array", "items": {"type": "string"}},
    },
    "required": [
        "summary",
        "diagnosis",
        "riskFactors",
        "medications",
        "recommendations",
    ],
}


class GeminiService:
    def __init__(self, settings: Optional[Settings] = None) -> None:
        self._settings = settings or get_settings()
        self._client: Optional[genai.Client] = None
        self._initialized = False

    @property
    def client(self) -> genai.Client:
        if self._client is None:
            api_key = self._settings.resolved_gemini_api_key
            if not api_key:
                raise GeminiConfigurationError(
                    "Gemini API key missing or invalid. Please configure GEMINI_API_KEY."
                )
            logger.info("Initializing Gemini client")
            self._client = genai.Client(api_key=api_key)
            self._initialized = True
        return self._client

    def validate_connection(self) -> None:
        api_key = self._settings.resolved_gemini_api_key
        if not api_key:
            raise GeminiConfigurationError(
                "Gemini API key missing or invalid. Please configure GEMINI_API_KEY."
            )

        logger.info("Validating Gemini API connection")
        try:
            self.client.models.generate_content(
                model=self._settings.gemini_model,
                contents="Respond with OK.",
                config=types.GenerateContentConfig(
                    max_output_tokens=16,
                    temperature=0,
                ),
            )
            logger.info("Gemini API connection validated successfully")
        except GeminiConfigurationError:
            raise
        except ClientError as exc:
            error_body = str(exc)
            if exc.code in (401, 403) or "API_KEY" in error_body or "API key" in error_body:
                logger.error("Gemini API key rejected: %s", exc)
                raise GeminiConfigurationError(
                    "Gemini API key missing or invalid. Please configure GEMINI_API_KEY."
                ) from exc
            logger.error("Gemini API validation failed: %s", exc)
            raise GeminiAPIError(f"Gemini API validation failed: {exc}") from exc
        except Exception as exc:
            logger.error("Gemini API validation failed: %s", exc)
            raise GeminiAPIError(f"Gemini API validation failed: {exc}") from exc

    def generate_completion(
        self,
        prompt: str,
        *,
        response_json: bool = False,
        response_schema: Optional[Dict[str, Any]] = None,
        temperature: float = 0.2,
        max_output_tokens: int = 4096,
    ) -> str:
        config_kwargs: Dict[str, Any] = {
            "temperature": temperature,
            "max_output_tokens": max_output_tokens,
        }

        if response_json:
            config_kwargs["response_mime_type"] = "application/json"
            if response_schema:
                config_kwargs["response_schema"] = response_schema

        try:
            response = self.client.models.generate_content(
                model=self._settings.gemini_model,
                contents=prompt,
                config=types.GenerateContentConfig(**config_kwargs),
            )
            text = response.text
            if not text:
                raise GeminiAPIError("Gemini returned an empty response")
            return text
        except GeminiConfigurationError:
            raise
        except GeminiAPIError:
            raise
        except Exception as exc:
            logger.error("Gemini API call failed: %s", exc)
            raise GeminiAPIError(f"Gemini API call failed: {exc}") from exc

    def generate_summary(self, text: str) -> Dict[str, Any]:
        prompt = (
            "You are a medical assistant analyzing patient reports.\n\n"
            "Analyze the following patient report and return a structured JSON response with:\n"
            "- summary: A concise patient summary\n"
            "- diagnosis: Primary diagnosis or assessment\n"
            "- riskFactors: List of identified risk factors\n"
            "- medications: List of current medications mentioned\n"
            "- recommendations: List of follow-up recommendations\n\n"
            "If information is not available in the report, use an empty string or empty list.\n\n"
            f"Report:\n\n{text}"
        )

        raw_response = self.generate_completion(
            prompt,
            response_json=True,
            response_schema=MEDICAL_SUMMARY_SCHEMA,
        )

        try:
            parsed = json.loads(raw_response)
        except json.JSONDecodeError as exc:
            logger.error("Failed to parse Gemini summary JSON: %s", exc)
            raise GeminiAPIError("Gemini returned invalid JSON for medical summary") from exc

        return {
            "summary": parsed.get("summary", ""),
            "diagnosis": parsed.get("diagnosis", ""),
            "riskFactors": parsed.get("riskFactors", []),
            "medications": parsed.get("medications", []),
            "recommendations": parsed.get("recommendations", []),
        }


_gemini_service: Optional[GeminiService] = None


def get_gemini_service() -> GeminiService:
    global _gemini_service
    if _gemini_service is None:
        _gemini_service = GeminiService()
    return _gemini_service
