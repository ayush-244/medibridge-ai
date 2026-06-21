import { FileText, Loader2, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RecommendationConfidence } from "@/features/ai-recommendations/components/RecommendationConfidence";
import { RecommendationEvidence } from "@/features/ai-recommendations/components/RecommendationEvidence";
import { useReferralSpecialistRecommendation } from "@/features/referrals/hooks/useReferralSpecialistRecommendation";
import { getSpecialistDisplayName } from "@/features/ai-recommendations/utils/specialistDisplay";

interface SpecialistRecommendationCardProps {
  referralId: string;
  enabled: boolean;
}

export function SpecialistRecommendationCard({
  referralId,
  enabled,
}: SpecialistRecommendationCardProps) {
  const {
    recommendation,
    source,
    isLoading,
    error,
    generateRecommendation,
    resetRecommendation,
  } = useReferralSpecialistRecommendation(enabled ? referralId : null);

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
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                  Recommended Specialist
                </p>
                {source === "documents" && (
                  <Badge variant="outline" className="gap-1 text-xs">
                    <FileText className="h-3 w-3" />
                    Based on Uploaded Records
                  </Badge>
                )}
                {source === "referral" && (
                  <Badge variant="outline" className="gap-1 text-xs text-amber-600 border-amber-200">
                    <FileText className="h-3 w-3" />
                    Based on Referral Details
                  </Badge>
                )}
              </div>
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
