import json
import re
from typing import Any, Dict, List, Optional

import requests
from requests import RequestException

from app.core.config import Settings, get_settings
from app.core.exceptions import LLMAPIError, LLMConfigurationError
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


class LLMService:
    def __init__(self, settings: Optional[Settings] = None) -> None:
        self._settings = settings or get_settings()

    def _api_key(self) -> str:
        api_key = self._settings.openrouter_api_key
        if not api_key:
            raise LLMConfigurationError(
                "OpenRouter API key missing or invalid. Please configure OPENROUTER_API_KEY."
            )
        return api_key

    def _chat_completions_url(self) -> str:
        base = self._settings.openrouter_base_url.rstrip("/")
        return f"{base}/chat/completions"

    def validate_connection(self) -> None:
        if not self._settings.openrouter_api_key:
            raise LLMConfigurationError(
                "OpenRouter API key missing or invalid. Please configure OPENROUTER_API_KEY."
            )

        logger.info("Validating OpenRouter API connection")
        try:
            self.generate_completion(
                "Respond with OK.",
                max_tokens=16,
                temperature=0,
            )
            logger.info("OpenRouter API connection validated successfully")
        except LLMConfigurationError:
            raise
        except LLMAPIError as exc:
            error_text = str(exc)
            if any(
                marker in error_text
                for marker in ("401", "403", "Unauthorized", "invalid", "API key")
            ):
                logger.error("OpenRouter API key rejected")
                raise LLMConfigurationError(
                    "OpenRouter API key missing or invalid. Please configure OPENROUTER_API_KEY."
                ) from exc
            raise
        except Exception as exc:
            logger.error("OpenRouter API validation failed: %s", exc)
            raise LLMAPIError(f"OpenRouter API validation failed: {exc}") from exc

    def generate_completion(
        self,
        prompt: str,
        *,
        response_json: bool = False,
        temperature: float = 0.2,
        max_tokens: int = 4096,
    ) -> str:
        payload: Dict[str, Any] = {
            "model": self._settings.openrouter_model,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": temperature,
            "max_tokens": max_tokens,
        }

        if response_json:
            payload["response_format"] = {"type": "json_object"}

        headers = {
            "Authorization": f"Bearer {self._api_key()}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://medibridge.ai",
            "X-Title": "MediBridge AI Service",
        }

        try:
            response = requests.post(
                self._chat_completions_url(),
                headers=headers,
                json=payload,
                timeout=120,
            )
        except RequestException as exc:
            logger.error("OpenRouter request failed: %s", exc)
            raise LLMAPIError(f"OpenRouter request failed: {exc}") from exc

        if response.status_code in (401, 403):
            logger.error("OpenRouter authentication failed (status=%s)", response.status_code)
            raise LLMConfigurationError(
                "OpenRouter API key missing or invalid. Please configure OPENROUTER_API_KEY."
            )

        if not response.ok:
            logger.error(
                "OpenRouter API error (status=%s): %s",
                response.status_code,
                response.text[:500],
            )
            raise LLMAPIError(
                f"OpenRouter API error (status={response.status_code})"
            )

        try:
            data = response.json()
            content = data["choices"][0]["message"]["content"]
        except (ValueError, KeyError, IndexError, TypeError) as exc:
            logger.error("Invalid OpenRouter response structure: %s", exc)
            raise LLMAPIError("OpenRouter returned an invalid response") from exc

        if not content or not str(content).strip():
            raise LLMAPIError("OpenRouter returned an empty response")

        return str(content).strip()

    def generate_summary(self, text: str) -> Dict[str, Any]:
        schema_description = json.dumps(MEDICAL_SUMMARY_SCHEMA)
        prompt = (
            "You are a medical assistant analyzing patient reports.\n\n"
            "Analyze the following patient report and return ONLY valid JSON matching this schema:\n"
            f"{schema_description}\n\n"
            "Field meanings:\n"
            "- summary: concise patient summary\n"
            "- diagnosis: primary diagnosis or assessment\n"
            "- riskFactors: list of identified risk factors\n"
            "- medications: list of current medications mentioned\n"
            "- recommendations: list of follow-up recommendations\n\n"
            "If information is not available, use an empty string or empty list.\n\n"
            f"Report:\n\n{text}"
        )

        raw_response = self.generate_completion(prompt, response_json=True)

        try:
            parsed = json.loads(raw_response)
        except json.JSONDecodeError:
            json_match = re.search(r"\{.*\}", raw_response, re.DOTALL)
            if not json_match:
                logger.error("Failed to parse OpenRouter summary JSON")
                raise LLMAPIError("LLM returned invalid JSON for medical summary")
            try:
                parsed = json.loads(json_match.group())
            except json.JSONDecodeError as exc:
                logger.error("Failed to parse OpenRouter summary JSON: %s", exc)
                raise LLMAPIError("LLM returned invalid JSON for medical summary") from exc

        return {
            "summary": parsed.get("summary", ""),
            "diagnosis": parsed.get("diagnosis", ""),
            "riskFactors": parsed.get("riskFactors", []),
            "medications": parsed.get("medications", []),
            "recommendations": parsed.get("recommendations", []),
        }


_llm_service: Optional[LLMService] = None


def get_llm_service() -> LLMService:
    global _llm_service
    if _llm_service is None:
        _llm_service = LLMService()
    return _llm_service


llm_service = get_llm_service()
