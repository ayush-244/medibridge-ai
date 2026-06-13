import { useCallback, useEffect, useState } from "react";
import { reportService } from "@/features/reports/services/report.service";
import type { ReportsData } from "@/features/reports/types/report.types";
import { showErrorToast } from "@/lib/toast";

interface UseReportsReturn {
  data: ReportsData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useReports(enabled = true): UseReportsReturn {
  const [data, setData] = useState<ReportsData | null>(null);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const reports = await reportService.getAllReports();
      setData(reports);
    } catch (err) {
      const message =
        (err as { message?: string })?.message || "Failed to load reports";
      setError(message);
      setData(null);
      showErrorToast(message);
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return { data, isLoading, error, refetch: fetchReports };
}
