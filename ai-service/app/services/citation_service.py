from typing import Any, Dict, List

MAX_CITATIONS = 5


def build_citations(results: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    seen: set[tuple[str, int]] = set()
    citations: List[Dict[str, Any]] = []

    for result in results:
        file_name = result.get("fileName", "")
        chunk_index = int(result.get("chunkIndex", 0))
        key = (file_name, chunk_index)

        if not file_name or key in seen:
            continue

        seen.add(key)
        citations.append(
            {
                "fileName": file_name,
                "chunkIndex": chunk_index,
            }
        )

        if len(citations) >= MAX_CITATIONS:
            break

    return citations
