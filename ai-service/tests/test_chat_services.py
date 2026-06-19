from unittest.mock import MagicMock, patch

import pytest

from app.core.exceptions import ChatGenerationError, NoDocumentsError
from app.services.citation_service import build_citations
from app.services.chat_service import build_context, chat_with_documents
from app.services.retriever_service import retrieve_chunks


SAMPLE_CHUNKS = [
    {
        "text": "Patient is taking Aspirin 81mg daily.",
        "fileName": "report.pdf",
        "chunkIndex": 1,
        "score": 0.92,
    },
    {
        "text": "Patient is taking Atorvastatin 20mg nightly.",
        "fileName": "report.pdf",
        "chunkIndex": 2,
        "score": 0.88,
    },
]


class TestRetrieverService:
    @patch("app.services.retriever_service.query_document_chunks")
    @patch("app.services.retriever_service.generate_embeddings")
    def test_retrieval_success(self, mock_embed, mock_query):
        mock_embed.return_value = [[0.1, 0.2, 0.3]]
        mock_query.return_value = [
            {
                "text": "Patient is taking Aspirin.",
                "metadata": {"fileName": "report.pdf", "chunkIndex": 1},
                "distance": 0.11,
            },
            {
                "text": "Patient is taking Aspirin.",
                "metadata": {"fileName": "report.pdf", "chunkIndex": 1},
                "distance": 0.15,
            },
        ]

        results = retrieve_chunks("PATIENT001", "What medications?")

        assert len(results) == 1
        assert results[0]["fileName"] == "report.pdf"
        assert results[0]["chunkIndex"] == 1
        assert results[0]["score"] == pytest.approx(0.89, abs=0.01)
        mock_query.assert_called_once()
        call_kwargs = mock_query.call_args.kwargs
        assert call_kwargs["patient_id"] == "PATIENT001"
        assert call_kwargs["top_k"] == 5

    @patch("app.services.retriever_service.query_document_chunks")
    @patch("app.services.retriever_service.generate_embeddings")
    def test_no_documents(self, mock_embed, mock_query):
        mock_embed.return_value = [[0.1, 0.2, 0.3]]
        mock_query.return_value = []

        results = retrieve_chunks("PATIENT001", "Any diagnosis?")

        assert results == []

    @patch("app.services.retriever_service.query_document_chunks")
    @patch("app.services.retriever_service.generate_embeddings")
    def test_invalid_patient_returns_empty(self, mock_embed, mock_query):
        mock_embed.return_value = [[0.1, 0.2, 0.3]]
        mock_query.return_value = []

        results = retrieve_chunks("  ", "What medications?")

        mock_query.assert_called_once_with(
            query_embedding=[0.1, 0.2, 0.3],
            patient_id="",
            top_k=5,
            settings=mock_query.call_args.kwargs["settings"],
        )
        assert results == []


class TestCitationService:
    def test_build_citations_deduplicates_and_limits(self):
        results = [
            {"fileName": "report.pdf", "chunkIndex": 1},
            {"fileName": "report.pdf", "chunkIndex": 1},
            {"fileName": "labs.pdf", "chunkIndex": 0},
            {"fileName": "notes.pdf", "chunkIndex": 3},
            {"fileName": "notes.pdf", "chunkIndex": 4},
            {"fileName": "notes.pdf", "chunkIndex": 5},
            {"fileName": "notes.pdf", "chunkIndex": 6},
        ]

        citations = build_citations(results)

        assert len(citations) == 5
        assert citations[0] == {"fileName": "report.pdf", "chunkIndex": 1}
        assert citations[1] == {"fileName": "labs.pdf", "chunkIndex": 0}

    def test_build_citations_skips_empty_file_names(self):
        results = [
            {"fileName": "", "chunkIndex": 0},
            {"fileName": "valid.pdf", "chunkIndex": 1},
        ]

        citations = build_citations(results)

        assert citations == [{"fileName": "valid.pdf", "chunkIndex": 1}]


class TestChatService:
    def test_build_context_respects_max_size(self):
        long_text = "A" * 4000
        chunks = [
            {"text": long_text, "fileName": "a.pdf", "chunkIndex": 0},
            {"text": long_text, "fileName": "b.pdf", "chunkIndex": 1},
        ]

        context = build_context(chunks, max_chars=6000)

        assert len(context) <= 6000
        assert "[Source: a.pdf, chunk 0]" in context

    @patch("app.services.chat_service.get_llm_service")
    @patch("app.services.chat_service.retrieve_chunks")
    def test_answer_and_citation_generation(self, mock_retrieve, mock_llm_factory):
        mock_retrieve.return_value = SAMPLE_CHUNKS
        mock_llm = MagicMock()
        mock_llm.generate_completion.return_value = json.dumps(
            {
                "answer": "Patient is taking Aspirin and Atorvastatin.",
                "summary": "Patient on cardiovascular therapy.",
                "evidence": ["Aspirin documented", "Atorvastatin documented"],
                "confidence": 92,
                "suggestedQuestions": ["What is the diagnosis?"],
            }
        )
        mock_llm_factory.return_value = mock_llm

        result = chat_with_documents("PATIENT001", "What medications?")

        assert result["answer"] == "Patient is taking Aspirin and Atorvastatin."
        assert result["summary"] == "Patient on cardiovascular therapy."
        assert result["confidence"] > 0
        assert len(result["citations"]) == 2
        assert result["citations"][0]["fileName"] == "report.pdf"
        mock_llm.generate_completion.assert_called_once()

    @patch("app.services.chat_service.retrieve_chunks")
    def test_no_context_available(self, mock_retrieve):
        mock_retrieve.return_value = []

        with pytest.raises(NoDocumentsError, match="No medical documents found"):
            chat_with_documents("PATIENT001", "What medications?")

    @patch("app.services.chat_service.get_llm_service")
    @patch("app.services.chat_service.retrieve_chunks")
    def test_llm_failure_raises_chat_error(self, mock_retrieve, mock_llm_factory):
        from app.core.exceptions import LLMAPIError

        mock_retrieve.return_value = SAMPLE_CHUNKS
        mock_llm = MagicMock()
        mock_llm.generate_completion.side_effect = LLMAPIError("API down")
        mock_llm_factory.return_value = mock_llm

        with pytest.raises(ChatGenerationError, match="Failed to generate response"):
            chat_with_documents("PATIENT001", "What medications?")
