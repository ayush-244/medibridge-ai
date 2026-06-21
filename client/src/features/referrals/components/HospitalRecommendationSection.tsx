import { Building2, Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RecommendationCard } from "@/components/recommendations/RecommendationCard";
import { RecommendationsSkeleton } from "@/components/recommendations/RecommendationsSkeleton";
import { useReferralHospitalMatching } from "@/features/referrals/hooks/useReferralHospitalMatching";

interface HospitalRecommendationSectionProps {
  referralId: string;
  enabled: boolean;
}

export function HospitalRecommendationSection({
  referralId,
  enabled,
}: HospitalRecommendationSectionProps) {
  const {
    data,
    isLoading,
    error,
    generateRecommendations,
    resetRecommendations,
  } = useReferralHospitalMatching(enabled ? referralId : null);

  if (!enabled) {
    return null;
  }

  return (
    <div className="mt-6 border-t border-border pt-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" />
            AI Hospital Recommendations
          </h4>
          <p className="mt-1 text-xs text-text-secondary">
            Matches patients to the best hospitals based on the recommended specialist, distance, and bed availability.
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          className="gap-2 whitespace-nowrap"
          onClick={() => {
            resetRecommendations();
            void generateRecommendations();
          }}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MapPin className="h-4 w-4" />
          )}
          Generate Hospitals
        </Button>
      </div>

      <div className="space-y-4">
        {isLoading && <RecommendationsSkeleton />}

        {error && !isLoading && (
          <div className="rounded-lg border border-danger/20 bg-danger/5 p-4">
            <p className="text-sm text-danger">{error}</p>
          </div>
        )}

        {!data && !isLoading && !error && (
          <div className="rounded-lg border border-dashed border-border p-8 text-center">
            <Building2 className="mx-auto mb-2 h-8 w-8 text-text-secondary/50" />
            <p className="text-sm font-medium text-text-secondary">
              No hospital recommendations generated yet.
            </p>
            <p className="mt-1 text-xs text-text-secondary/70">
              Click the button above to match hospitals based on referral details.
            </p>
          </div>
        )}

        {data && !isLoading && (
          <div className="space-y-4">
            {data.recommendedHospitals.map((hospital, index) => (
              <RecommendationCard
                key={hospital.hospitalId}
                hospital={hospital}
                rank={index + 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
