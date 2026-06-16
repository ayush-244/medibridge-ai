interface RecommendationConfidenceProps {
  confidence: number;
}

function getConfidenceTone(confidence: number) {
  if (confidence >= 85) {
    return "text-success";
  }
  if (confidence >= 60) {
    return "text-warning";
  }
  return "text-danger";
}

export function RecommendationConfidence({
  confidence,
}: RecommendationConfidenceProps) {
  return (
    <p className="text-sm text-text-secondary">
      Confidence:{" "}
      <span className={`font-semibold ${getConfidenceTone(confidence)}`}>
        {confidence}%
      </span>
    </p>
  );
}
