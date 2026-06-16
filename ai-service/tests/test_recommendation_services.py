from unittest.mock import MagicMock, patch

import json
import pytest

from app.core.exceptions import NoDocumentsError, RecommendationGenerationError
from app.core.specializations import (
    SPECIALIZATIONS,
    is_valid_specialization,
    normalize_specialization,
)
from app.services.recommendation_service import (
    _merge_clinical_chunks,
    _parse_recommendation_response,
    recommend_specialist,
)

SAMPLE_CHUNKS = [
    {
        "text": "Patient diagnosed with coronary artery disease.",
        "fileName": "Discharge_Summary.pdf",
        "chunkIndex": 2,
        "score": 0.94,
    },
    {
        "text": "Patient reports chest pain and hypertension.",
        "fileName": "Discharge_Summary.pdf",
        "chunkIndex": 3,
        "score": 0.91,
    },
]


class TestSpecializations:
    def test_valid_specialization(self):
        assert is_valid_specialization("Cardiology") is True
        assert is_valid_specialization("Unknown") is False

    def test_normalize_exact_match(self):
        assert normalize_specialization("Cardiology") == "Cardiology"

    def test_normalize_alias(self):
        assert normalize_specialization("Cardiologist") == "Cardiology"
        assert normalize_specialization("Neurologist") == "Neurology"

    def test_normalize_invalid(self):
        assert normalize_specialization("Alien Medicine") is None

    def test_specializations_catalogue(self):
        assert "Cardiology" in SPECIALIZATIONS
        assert "Surgery" in SPECIALIZATIONS


class TestParseRecommendationResponse:
    def test_parse_valid_json(self):
        raw = (
            '{"specialist": "Cardiology", "confidence": 94, '
            '"reason": "Coronary artery disease documented."}'
        )
        result = _parse_recommendation_response(raw)

        assert result["specialist"] == "Cardiology"
        assert result["confidence"] == 94
        assert "Coronary artery disease" in result["reason"]

    def test_parse_alias_specialist(self):
        raw = (
            '{"specialist": "Cardiologist", "confidence": 88, '
            '"reason": "Cardiac risk factors present."}'
        )
        result = _parse_recommendation_response(raw)

        assert result["specialist"] == "Cardiology"

    def test_confidence_clamped(self):
        raw = (
            '{"specialist": "Cardiology", "confidence": 150, '
            '"reason": "Strong cardiac evidence."}'
        )
        result = _parse_recommendation_response(raw)
        assert result["confidence"] == 100

    def test_confidence_clamped_negative(self):
        raw = (
            '{"specialist": "Cardiology", "confidence": -10, '
            '"reason": "Weak cardiac evidence."}'
        )
        result = _parse_recommendation_response(raw)
        assert result["confidence"] == 0

    def test_invalid_specialist_raises(self):
        raw = (
            '{"specialist": "Alien Medicine", "confidence": 80, '
            '"reason": "Unknown specialty."}'
        )
        with pytest.raises(RecommendationGenerationError):
            _parse_recommendation_response(raw)

    def test_missing_reason_raises(self):
        raw = '{"specialist": "Cardiology", "confidence": 80, "reason": ""}'
        with pytest.raises(RecommendationGenerationError):
            _parse_recommendation_response(raw)

    def test_invalid_json_raises(self):
        with pytest.raises(RecommendationGenerationError):
            _parse_recommendation_response("not json")

    def test_parse_embedded_json(self):
        raw = (
            'Analysis complete: {"specialist": "Cardiology", "confidence": 90, '
            '"reason": "Coronary artery disease documented."}'
        )
        result = _parse_recommendation_response(raw)

        assert result["specialist"] == "Cardiology"
        assert result["confidence"] == 90

    def test_invalid_confidence_type_raises(self):
        raw = (
            '{"specialist": "Cardiology", "confidence": "high", '
            '"reason": "Cardiac evidence present."}'
        )
        with pytest.raises(RecommendationGenerationError):
            _parse_recommendation_response(raw)

    def test_malformed_embedded_json_raises(self):
        raw = 'Result: {"specialist": "Cardiology", confidence: broken}'
        with pytest.raises(RecommendationGenerationError):
            _parse_recommendation_response(raw)


class TestMergeClinicalChunks:
    @patch("app.services.recommendation_service.retrieve_chunks")
    def test_merge_deduplicates_across_queries(self, mock_retrieve):
        mock_retrieve.side_effect = [
            [SAMPLE_CHUNKS[0], SAMPLE_CHUNKS[1]],
            [SAMPLE_CHUNKS[0]],
            [],
            [SAMPLE_CHUNKS[1]],
            [],
        ]

        merged = _merge_clinical_chunks("PATIENT001")

        assert len(merged) == 2
        assert mock_retrieve.call_count == 5
        assert all(call.kwargs["patient_id"] == "PATIENT001" for call in mock_retrieve.call_args_list)


class TestRecommendSpecialist:
    @patch("app.services.recommendation_service.get_llm_service")
    @patch("app.services.recommendation_service._merge_clinical_chunks")
    def test_recommendation_generation(self, mock_merge, mock_llm_factory):
        mock_merge.return_value = SAMPLE_CHUNKS
        mock_llm = MagicMock()
        mock_llm.generate_completion.return_value = (
            '{"specialist": "Cardiology", "confidence": 94, '
            '"reason": "Patient has coronary artery disease and chest pain."}'
        )
        mock_llm_factory.return_value = mock_llm

        result = recommend_specialist("PATIENT001")

        assert result["specialist"] == "Cardiology"
        assert result["recommendedSpecialist"] == "Cardiology"
        assert result["confidence"] == 94
        assert "coronary artery disease" in result["reason"]
        assert len(result["supportingEvidence"]) == 2
        assert result["supportingEvidence"][0]["fileName"] == "Discharge_Summary.pdf"
        mock_llm.generate_completion.assert_called_once()
        call_kwargs = mock_llm.generate_completion.call_args.kwargs
        assert call_kwargs["response_json"] is True

    @patch("app.services.recommendation_service._merge_clinical_chunks")
    def test_no_documents(self, mock_merge):
        mock_merge.return_value = []

        with pytest.raises(NoDocumentsError, match="No medical documents found"):
            recommend_specialist("PATIENT001")

    @patch("app.services.recommendation_service.get_llm_service")
    @patch("app.services.recommendation_service._merge_clinical_chunks")
    def test_unexpected_llm_exception(self, mock_merge, mock_llm_factory):
        mock_merge.return_value = SAMPLE_CHUNKS
        mock_llm = MagicMock()
        mock_llm.generate_completion.side_effect = RuntimeError("unexpected")
        mock_llm_factory.return_value = mock_llm

        with pytest.raises(
            RecommendationGenerationError,
            match="Failed to generate specialist recommendation",
        ):
            recommend_specialist("PATIENT001")

    @patch("app.services.recommendation_service.get_llm_service")
    @patch("app.services.recommendation_service._merge_clinical_chunks")
    def test_llm_failure(self, mock_merge, mock_llm_factory):
        from app.core.exceptions import LLMAPIError

        mock_merge.return_value = SAMPLE_CHUNKS
        mock_llm = MagicMock()
        mock_llm.generate_completion.side_effect = LLMAPIError("API down")
        mock_llm_factory.return_value = mock_llm

        with pytest.raises(
            RecommendationGenerationError,
            match="Failed to generate specialist recommendation",
        ):
            recommend_specialist("PATIENT001")

    @patch("app.services.recommendation_service.get_llm_service")
    @patch("app.services.recommendation_service._merge_clinical_chunks")
    def test_invalid_llm_response(self, mock_merge, mock_llm_factory):
        mock_merge.return_value = SAMPLE_CHUNKS
        mock_llm = MagicMock()
        mock_llm.generate_completion.return_value = (
            '{"specialist": "Unknown", "confidence": 70, "reason": "Test"}'
        )
        mock_llm_factory.return_value = mock_llm

        with pytest.raises(RecommendationGenerationError):
            recommend_specialist("PATIENT001")

    @patch("app.services.recommendation_service.get_llm_service")
    @patch("app.services.recommendation_service._merge_clinical_chunks")
    def test_citation_generation_limited_to_five(self, mock_merge, mock_llm_factory):
        many_chunks = [
            {
                "text": f"Evidence chunk {index}",
                "fileName": f"file_{index}.pdf",
                "chunkIndex": index,
                "score": 0.9 - index * 0.01,
            }
            for index in range(8)
        ]
        mock_merge.return_value = many_chunks
        mock_llm = MagicMock()
        mock_llm.generate_completion.return_value = (
            '{"specialist": "Cardiology", "confidence": 75, '
            '"reason": "Cardiac findings in records."}'
        )
        mock_llm_factory.return_value = mock_llm

        result = recommend_specialist("PATIENT001")

        assert len(result["supportingEvidence"]) == 5

    @patch("app.services.recommendation_service.get_llm_service")
    @patch("app.services.recommendation_service._merge_clinical_chunks")
    def test_empty_context_after_merge_raises_no_documents(
        self, mock_merge, mock_llm_factory
    ):
        mock_merge.return_value = [
            {"text": "   ", "fileName": "empty.pdf", "chunkIndex": 0, "score": 0.5}
        ]

        with pytest.raises(NoDocumentsError, match="No medical documents found"):
            recommend_specialist("PATIENT001")

        mock_llm_factory.assert_not_called()


CLINICAL_SCENARIOS = [
    (
        "cardiology",
        [
            {
                "text": (
                    "Symptoms: Chest pain, Shortness of breath. "
                    "Diagnosis: Coronary artery disease. "
                    "History: Hypertension, Diabetes."
                ),
                "fileName": "cardiac_report.pdf",
                "chunkIndex": 0,
                "score": 0.95,
            }
        ],
        "Cardiologist",
        "Cardiology",
    ),
    (
        "neurology",
        [
            {
                "text": (
                    "Symptoms: Headache, Dizziness. MRI: Brain lesion identified."
                ),
                "fileName": "neuro_mri.pdf",
                "chunkIndex": 1,
                "score": 0.93,
            }
        ],
        "Neurologist",
        "Neurology",
    ),
    (
        "orthopedics",
        [
            {
                "text": "Symptoms: Knee pain. Diagnosis: Osteoarthritis.",
                "fileName": "ortho_notes.pdf",
                "chunkIndex": 2,
                "score": 0.91,
            }
        ],
        "Orthopedic Surgeon",
        "Orthopedics",
    ),
    (
        "pulmonology",
        [
            {
                "text": "COPD. Chronic cough. Shortness of breath.",
                "fileName": "pulmonary_report.pdf",
                "chunkIndex": 0,
                "score": 0.92,
            }
        ],
        "Pulmonologist",
        "Pulmonology",
    ),
]


class TestClinicalRecommendationScenarios:
    @pytest.mark.parametrize(
        "scenario_id,chunks,llm_specialist,expected_specialization",
        CLINICAL_SCENARIOS,
        ids=[scenario[0] for scenario in CLINICAL_SCENARIOS],
    )
    @patch("app.services.recommendation_service.get_llm_service")
    @patch("app.services.recommendation_service._merge_clinical_chunks")
    def test_clinical_scenario_normalization(
        self,
        mock_merge,
        mock_llm_factory,
        scenario_id,
        chunks,
        llm_specialist,
        expected_specialization,
    ):
        mock_merge.return_value = chunks
        mock_llm = MagicMock()
        mock_llm.generate_completion.return_value = json.dumps(
            {
                "specialist": llm_specialist,
                "confidence": 94,
                "reason": f"Clinical evidence supports {expected_specialization}.",
            }
        )
        mock_llm_factory.return_value = mock_llm

        result = recommend_specialist("PATIENT001")

        assert result["specialist"] == expected_specialization
        assert result["confidence"] == 94
        assert result["supportingEvidence"][0]["fileName"] == chunks[0]["fileName"]
