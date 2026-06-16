from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient

from app.api.chat import router as chat_router
from app.core.exceptions import ChatGenerationError, NoDocumentsError
from app.main import app
from fastapi import FastAPI


@pytest.fixture
def client():
    test_app = FastAPI()
    test_app.include_router(chat_router, prefix="/api/ai")
    return TestClient(test_app)


class TestChatApi:
    @patch("app.api.chat.chat_with_documents")
    def test_chat_success(self, mock_chat, client):
        mock_chat.return_value = {
            "answer": "Patient is taking Aspirin and Atorvastatin.",
            "citations": [{"fileName": "report.pdf", "chunkIndex": 3}],
        }

        response = client.post(
            "/api/ai/chat",
            json={
                "patient_id": "PATIENT001",
                "question": "What medications is the patient taking?",
            },
        )

        assert response.status_code == 200
        body = response.json()
        assert body["success"] is True
        assert body["data"]["answer"] == "Patient is taking Aspirin and Atorvastatin."
        assert body["data"]["citations"] == [{"fileName": "report.pdf", "chunkIndex": 3}]

    def test_validation_failure_missing_question(self, client):
        response = client.post(
            "/api/ai/chat",
            json={"patient_id": "PATIENT001", "question": ""},
        )

        assert response.status_code == 422

    def test_validation_failure_missing_patient_id(self, client):
        response = client.post(
            "/api/ai/chat",
            json={"patient_id": "", "question": "What medications?"},
        )

        assert response.status_code == 422

    @patch("app.api.chat.chat_with_documents")
    def test_no_documents_response(self, mock_chat, client):
        mock_chat.side_effect = NoDocumentsError(
            "No medical documents found for this patient."
        )

        response = client.post(
            "/api/ai/chat",
            json={
                "patient_id": "PATIENT001",
                "question": "What is the primary diagnosis?",
            },
        )

        assert response.status_code == 200
        body = response.json()
        assert body["success"] is False
        assert body["message"] == "No medical documents found for this patient."

    @patch("app.api.chat.chat_with_documents")
    def test_llm_failure_response(self, mock_chat, client):
        mock_chat.side_effect = ChatGenerationError("Failed to generate response.")

        response = client.post(
            "/api/ai/chat",
            json={
                "patient_id": "PATIENT001",
                "question": "What are the patient's risk factors?",
            },
        )

        assert response.status_code == 200
        body = response.json()
        assert body["success"] is False
        assert body["message"] == "Failed to generate response."


class TestMainAppRegistration:
    def test_chat_route_registered(self):
        openapi_paths = app.openapi().get("paths", {})
        assert "/api/ai/chat" in openapi_paths
