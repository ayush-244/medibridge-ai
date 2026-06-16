import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RecommendationConfidence } from "@/features/ai-recommendations/components/RecommendationConfidence";
import { RecommendationEvidence } from "@/features/ai-recommendations/components/RecommendationEvidence";
import { useSpecialistRecommendation } from "@/features/ai-recommendations/hooks/useSpecialistRecommendation";
import { getSpecialistDisplayName } from "@/features/ai-recommendations/utils/specialistDisplay";

interface SpecialistRecommendationCardProps {
  patientId: string;
  enabled: boolean;
}

export function SpecialistRecommendationCard({
  patientId,
  enabled,
}: SpecialistRecommendationCardProps) {
  const {
    recommendation,
    isLoading,
    error,
    generateRecommendation,
    resetRecommendation,
  } = useSpecialistRecommendation(enabled ? patientId : null);

  if (!enabled) {
    return null;
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <h4 className="text-sm font-semibold">AI Recommendation</h4>
        <Button
          variant="secondary"
          size="sm"
          className="gap-2"
          onClick={() => {
            resetRecommendation();
            void generateRecommendation();
          }}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          Generate Recommendation
        </Button>
      </div>

      <div className="rounded-lg border border-border px-4 py-4">
        {!recommendation && !isLoading && !error && (
          <p className="text-sm text-text-secondary">
            No recommendation available
          </p>
        )}

        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating recommendation...
          </div>
        )}

        {error && !isLoading && (
          <p className="text-sm text-danger">{error}</p>
        )}

        {recommendation && !isLoading && (
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                Recommended Specialist
              </p>
              <p className="mt-1 text-lg font-semibold text-text-primary">
                {getSpecialistDisplayName(recommendation.specialist)}
              </p>
              <RecommendationConfidence confidence={recommendation.confidence} />
            </div>

            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-text-secondary">
                Reason
              </p>
              <p className="text-sm leading-relaxed text-text-primary">
                {recommendation.reason}
              </p>
            </div>

            <RecommendationEvidence evidence={recommendation.supportingEvidence} />
          </div>
        )}
      </div>
    </div>
  );
}
