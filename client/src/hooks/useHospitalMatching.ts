import { useCallback, useEffect, useState } from "react";
import { recommendationService } from "@/services/recommendation.service";
import type { HospitalMatchResult } from "@/types/recommendation.types";

interface UseHospitalMatchingOptions {
  patientId: string | null;
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
  patientId,
  referralId,
  enabled = true,
}: UseHospitalMatchingOptions): UseHospitalMatchingReturn {
  const [data, setData] = useState<HospitalMatchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = useCallback(async () => {
    if (!patientId || !referralId) {
      setError("Patient ID and Referral ID are required.");
      setData(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await recommendationService.matchHospitals({
        patient_id: patientId,
        referral_id: referralId,
      });
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
  }, [patientId, referralId]);

  useEffect(() => {
    if (enabled && patientId && referralId) {
      void fetchRecommendations();
    }
  }, [enabled, patientId, referralId, fetchRecommendations]);

  return {
    data,
    isLoading,
    error,
    retry: fetchRecommendations,
  };
}
