from unittest.mock import MagicMock, patch

from app.services.vector_service import query_document_chunks


class TestPatientIsolation:
    @patch("app.services.vector_service._get_collection")
    def test_query_always_filters_by_patient_id(self, mock_get_collection):
        mock_collection = MagicMock()
        mock_get_collection.return_value = mock_collection
        mock_collection.query.return_value = {
            "documents": [[]],
            "metadatas": [[]],
            "distances": [[]],
        }

        query_document_chunks(
            query_embedding=[0.1, 0.2, 0.3],
            patient_id="PATIENT001",
            top_k=5,
        )

        mock_collection.query.assert_called_once()
        call_kwargs = mock_collection.query.call_args.kwargs
        assert call_kwargs["where"] == {"patientId": "PATIENT001"}
        assert call_kwargs["n_results"] == 5
