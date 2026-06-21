import { useCallback, useEffect, useState } from "react";
import { referralRecommendationsService } from "@/features/referrals/services/referralRecommendations.service";
import type { HospitalMatchResult } from "@/types/recommendation.types";

interface UseHospitalMatchingOptions {
  referralId: string | null;
  enabled?: boolean;
}

interface UseHospitalMatchingReturn {
  data: HospitalMatchResult | null;
  isLoading: boolean;
  error: string | null;
  retry: () => Promise<void>;
}

export function useHospitalMatching({
  referralId,
  enabled = true,
}: UseHospitalMatchingOptions): UseHospitalMatchingReturn {
  const [data, setData] = useState<HospitalMatchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = useCallback(async () => {
    if (!referralId) {
      setError("Referral ID is required.");
      setData(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await referralRecommendationsService.generateHospitalRecommendations(
        referralId,
      );
      setData(result);
    } catch (err) {
      const message =
        (err as { message?: string })?.message ||
        "Unable to fetch hospital recommendations";
      setError(message);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [referralId]);

  useEffect(() => {
    if (enabled && referralId) {
      void fetchRecommendations();
    }
  }, [enabled, referralId, fetchRecommendations]);

  return {
    data,
    isLoading,
    error,
    retry: fetchRecommendations,
  };
}
