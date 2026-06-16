import { useCallback, useState } from "react";
import { recommendationService } from "@/features/ai-recommendations/services/recommendation.service";
import type { SpecialistRecommendation } from "@/features/ai-recommendations/types/recommendation.types";
import { showErrorToast } from "@/lib/toast";

export function useSpecialistRecommendation(patientId: string | null) {
  const [recommendation, setRecommendation] =
    useState<SpecialistRecommendation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateRecommendation = useCallback(async () => {
    if (!patientId) {
      setError("Patient identifier is required.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await recommendationService.recommendSpecialist({
        patient_id: patientId,
      });
      setRecommendation(result);
    } catch (err) {
      const message = "Unable to generate recommendation";
      setError(message);
      setRecommendation(null);
      showErrorToast(message);
    } finally {
      setIsLoading(false);
    }
  }, [patientId]);

  const resetRecommendation = useCallback(() => {
    setRecommendation(null);
    setError(null);
  }, []);

  return {
    recommendation,
    isLoading,
    error,
    generateRecommendation,
    resetRecommendation,
  };
}
