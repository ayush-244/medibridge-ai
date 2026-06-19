import { RefreshCw, Sparkles } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { RecommendationCard } from "@/components/recommendations/RecommendationCard";
import { RecommendationsSkeleton } from "@/components/recommendations/RecommendationsSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useHospitalMatching } from "@/hooks/useHospitalMatching";
import { getSpecialistDisplayName } from "@/features/ai-recommendations/utils/specialistDisplay";

export function AIRecommendationsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const patientId = searchParams.get("patient_id");
  const referralId = searchParams.get("referral_id");

  const { data, isLoading, error, retry } = useHospitalMatching({
    patientId,
    referralId,
    enabled: Boolean(patientId && referralId),
  });

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const nextPatientId = String(formData.get("patient_id") ?? "").trim();
    const nextReferralId = String(formData.get("referral_id") ?? "").trim();

    if (nextPatientId && nextReferralId) {
      setSearchParams({
        patient_id: nextPatientId,
        referral_id: nextReferralId,
      });
    }
  };

  const hasQueryParams = Boolean(patientId && referralId);
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

      <form
        onSubmit={handleSearch}
        className="grid gap-4 rounded-lg border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto]"
      >
        <div className="space-y-2">
          <label htmlFor="patient_id" className="text-sm font-medium">
            Patient ID
          </label>
          <Input
            id="patient_id"
            name="patient_id"
            placeholder="e.g. PATIENT002"
            defaultValue={patientId ?? ""}
            required
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="referral_id" className="text-sm font-medium">
            Referral ID
          </label>
          <Input
            id="referral_id"
            name="referral_id"
            placeholder="Referral identifier"
            defaultValue={referralId ?? ""}
            required
          />
        </div>
        <div className="flex items-end">
          <Button type="submit" className="w-full gap-2 sm:w-auto">
            <Sparkles className="h-4 w-4" />
            Get Recommendations
          </Button>
        </div>
      </form>

      {!hasQueryParams && (
        <EmptyState
          title="Enter referral details"
          description="Provide a patient ID and referral ID to generate AI-powered hospital recommendations."
          icon={<Sparkles className="h-6 w-6" />}
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
