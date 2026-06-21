import { RefreshCw, Sparkles, UserPlus } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { RecommendationCard } from "@/components/recommendations/RecommendationCard";
import { RecommendationsSkeleton } from "@/components/recommendations/RecommendationsSkeleton";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useHospitalMatching } from "@/hooks/useHospitalMatching";
import { useReferrals } from "@/features/referrals/hooks/useReferrals";
import { getSpecialistDisplayName } from "@/features/ai-recommendations/utils/specialistDisplay";

export function AIRecommendationsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  // We ignore patient_id completely from the URL if it exists
  const referralId = searchParams.get("referral_id");

  const { referrals: allReferrals, isLoading: isReferralsLoading } = useReferrals();
  
  const referrals = allReferrals.filter(
    ref => ref.status === "PENDING"
  );

  const { data, isLoading, error, retry } = useHospitalMatching({
    referralId,
    enabled: Boolean(referralId),
  });

  const handleReferralChange = (value: string) => {
    setSearchParams({ referral_id: value });
  };

  const hasQueryParams = Boolean(referralId);
  const recommendations = data?.recommendedHospitals ?? [];
  const isEmpty = hasQueryParams && !isLoading && !error && recommendations.length === 0;

  return (
    <div className="page-container space-y-6">
      <PageHeader
        title="AI Hospital Recommendations"
        description="Ranked hospital matches based on specialist fit, capacity, beds, and distance"
        action={
          hasQueryParams ? (
            <Button
              variant="secondary"
              size="sm"
              className="gap-2"
              onClick={() => void retry()}
              disabled={isLoading}
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          ) : undefined
        }
      />

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="space-y-2 max-w-xl">
          <label htmlFor="referral_select" className="text-sm font-medium">
            Select Referral
          </label>
          <Select
            value={referralId ?? undefined}
            onValueChange={handleReferralChange}
            disabled={isReferralsLoading}
          >
            <SelectTrigger id="referral_select">
              <SelectValue placeholder="Select a patient referral to match hospitals..." />
            </SelectTrigger>
            <SelectContent>
              {referrals.map((ref) => (
                <SelectItem key={ref._id} value={ref._id}>
                  {ref.patientName} — {ref.condition}
                </SelectItem>
              ))}
              {referrals.length === 0 && !isReferralsLoading && (
                <SelectItem value="empty" disabled>
                  No pending outbound referrals found.
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!hasQueryParams && (
        <EmptyState
          title="Select a referral"
          description="Choose a referral from the dropdown above to generate AI-powered hospital recommendations."
          icon={<UserPlus className="h-6 w-6" />}
        />
      )}

      {hasQueryParams && error && !isLoading && (
        <EmptyState
          title="Failed to load recommendations"
          description={error}
          icon={<Sparkles className="h-6 w-6" />}
          action={
            <Button onClick={() => void retry()} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          }
        />
      )}

      {hasQueryParams && isLoading && <RecommendationsSkeleton />}

      {hasQueryParams && !isLoading && !error && data && recommendations.length > 0 && (
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-primary/5 px-4 py-3">
            <p className="text-sm text-text-secondary">Recommended Specialist</p>
            <p className="text-lg font-semibold text-text-primary">
              {getSpecialistDisplayName(data.specialist)}
            </p>
          </div>

          {recommendations.map((hospital, index) => (
            <RecommendationCard
              key={hospital.hospitalId}
              hospital={hospital}
              rank={index + 1}
            />
          ))}
        </div>
      )}

      {isEmpty && (
        <EmptyState
          title="No Recommendations Found"
          description="No matching hospitals were found for this referral. Try refreshing or verify the referral details."
          icon={<Sparkles className="h-6 w-6" />}
          action={
            <Button variant="secondary" onClick={() => void retry()} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          }
        />
      )}
    </div>
  );
}

