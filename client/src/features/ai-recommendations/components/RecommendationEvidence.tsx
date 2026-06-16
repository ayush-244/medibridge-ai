import type { RecommendationCitation } from "@/features/ai-recommendations/types/recommendation.types";

interface RecommendationEvidenceProps {
  evidence: RecommendationCitation[];
}

export function RecommendationEvidence({ evidence }: RecommendationEvidenceProps) {
  if (evidence.length === 0) {
    return null;
  }

  return (
    <div>
      <h5 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-secondary">
        Supporting Evidence
      </h5>
      <ul className="space-y-1.5">
        {evidence.map((item) => (
          <li
            key={`${item.fileName}-${item.chunkIndex}`}
            className="text-sm text-text-primary"
          >
            {item.fileName}
            <span className="text-text-secondary"> · chunk {item.chunkIndex}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
