import { useCallback, useState } from "react";
import { referralRecommendationsService } from "@/features/referrals/services/referralRecommendations.service";
import type { HospitalMatchResult } from "@/types/recommendation.types";
import { showErrorToast } from "@/lib/toast";

export function useReferralHospitalMatching(referralId: string | null) {
  const [data, setData] = useState<HospitalMatchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateRecommendations = useCallback(async () => {
    if (!referralId) {
      setError("No referral selected.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result =
        await referralRecommendationsService.generateHospitalRecommendations(
          referralId,
        );
      setData(result);
    } catch (err) {
      const message =
        (err as { message?: string })?.message ||
        "Unable to generate hospital recommendations";
      setError(message);
      setData(null);
      showErrorToast(message);
    } finally {
      setIsLoading(false);
    }
  }, [referralId]);

  const resetRecommendations = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return {
    data,
    isLoading,
    error,
    generateRecommendations,
    resetRecommendations,
  };
}
