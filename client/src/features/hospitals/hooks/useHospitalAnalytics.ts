import { useCallback, useEffect, useState } from "react";
import { reportService } from "@/features/reports/services/report.service";
import type { HospitalAnalytics } from "@/features/reports/types/report.types";

export function useHospitalAnalytics(hospitalId: string | null) {
  const [analytics, setAnalytics] = useState<HospitalAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    if (!hospitalId) {
      setAnalytics(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await reportService.getHospitalAnalytics(hospitalId);
      setAnalytics(data);
    } catch (err) {
      setError(
        (err as { message?: string })?.message ||
          "Failed to load hospital analytics",
      );
      setAnalytics(null);
    } finally {
      setIsLoading(false);
    }
  }, [hospitalId]);

  useEffect(() => {
    void fetchAnalytics();
  }, [fetchAnalytics]);

  return { analytics, isLoading, error, refetch: fetchAnalytics };
}
