import { useCallback, useState } from "react";
import { referralRecommendationsService } from "@/features/referrals/services/referralRecommendations.service";
import type { SpecialistRecommendation } from "@/features/ai-recommendations/types/recommendation.types";
import { showErrorToast } from "@/lib/toast";

export type RecommendationSource = "documents" | "referral" | null;

/**
 * Hook for generating specialist recommendations from a referral.
 *
 * Uses the Node BFF endpoint — no patient_id or ObjectId required.
 * Exposes the recommendation source so the UI can show an appropriate badge.
 */
export function useReferralSpecialistRecommendation(
  referralId: string | null,
) {
  const [recommendation, setRecommendation] =
    useState<SpecialistRecommendation | null>(null);
  const [source, setSource] = useState<RecommendationSource>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateRecommendation = useCallback(async () => {
    if (!referralId) {
      setError("No referral selected.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result =
        await referralRecommendationsService.generateSpecialistRecommendation(
          referralId,
        );
      setRecommendation(result);
      setSource((result.source as RecommendationSource) ?? null);
    } catch (err) {
      const message =
        (err as { message?: string })?.message ||
        "Unable to generate recommendation";
      setError(message);
      setRecommendation(null);
      setSource(null);
      showErrorToast(message);
    } finally {
      setIsLoading(false);
    }
  }, [referralId]);

  const resetRecommendation = useCallback(() => {
    setRecommendation(null);
    setSource(null);
    setError(null);
  }, []);

  return {
    recommendation,
    source,
    isLoading,
    error,
    generateRecommendation,
    resetRecommendation,
  };
}
