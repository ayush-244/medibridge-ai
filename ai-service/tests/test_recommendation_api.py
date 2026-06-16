from unittest.mock import patch

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.api.recommendation import router as recommendation_router
from app.core.exceptions import NoDocumentsError, RecommendationGenerationError
from app.main import app


@pytest.fixture
def client():
    test_app = FastAPI()
    test_app.include_router(recommendation_router, prefix="/api/ai")
    return TestClient(test_app)


class TestRecommendationApi:
    @patch("app.api.recommendation.recommend_specialist")
    def test_recommendation_success(self, mock_recommend, client):
        mock_recommend.return_value = {
            "specialist": "Cardiology",
            "recommendedSpecialist": "Cardiology",
            "confidence": 94,
            "reason": (
                "Patient has coronary artery disease, chest pain, hypertension "
                "and diabetes indicating need for cardiac specialist evaluation."
            ),
            "supportingEvidence": [
                {"fileName": "Discharge_Summary.pdf", "chunkIndex": 2},
            ],
        }

        response = client.post(
            "/api/ai/recommend-specialist",
            json={"patient_id": "PATIENT001"},
        )

        assert response.status_code == 200
        body = response.json()
        assert body["success"] is True
        assert body["data"]["specialist"] == "Cardiology"
        assert body["data"]["recommendedSpecialist"] == "Cardiology"
        assert body["data"]["confidence"] == 94
        assert body["data"]["supportingEvidence"] == [
            {"fileName": "Discharge_Summary.pdf", "chunkIndex": 2}
        ]

    def test_validation_failure_missing_patient_id(self, client):
        response = client.post(
            "/api/ai/recommend-specialist",
            json={"patient_id": ""},
        )

        assert response.status_code == 422

    def test_validation_failure_missing_request_body(self, client):
        response = client.post("/api/ai/recommend-specialist")

        assert response.status_code == 422

    @patch("app.api.recommendation.recommend_specialist")
    def test_no_documents_response(self, mock_recommend, client):
        mock_recommend.side_effect = NoDocumentsError(
            "No medical documents found for this patient."
        )

        response = client.post(
            "/api/ai/recommend-specialist",
            json={"patient_id": "PATIENT001"},
        )

        assert response.status_code == 200
        body = response.json()
        assert body["success"] is False
        assert body["message"] == "No medical documents found for this patient."

    @patch("app.api.recommendation.recommend_specialist")
    def test_recommendation_failure_response(self, mock_recommend, client):
        mock_recommend.side_effect = RecommendationGenerationError(
            "Failed to generate specialist recommendation."
        )

        response = client.post(
            "/api/ai/recommend-specialist",
            json={"patient_id": "PATIENT001"},
        )

        assert response.status_code == 200
        body = response.json()
        assert body["success"] is False
        assert body["message"] == "Failed to generate specialist recommendation."

    @patch("app.api.recommendation.recommend_specialist")
    def test_unexpected_error_response(self, mock_recommend, client):
        mock_recommend.side_effect = RuntimeError("unexpected")

        response = client.post(
            "/api/ai/recommend-specialist",
            json={"patient_id": "PATIENT001"},
        )

        assert response.status_code == 200
        body = response.json()
        assert body["success"] is False
        assert body["message"] == "Failed to generate specialist recommendation."


class TestMainAppRegistration:
    def test_recommendation_route_registered(self):
        openapi_paths = app.openapi().get("paths", {})
        assert "/api/ai/recommend-specialist" in openapi_paths
