import { useCallback, useEffect, useState } from "react";
import { dashboardService } from "@/features/dashboard/services/dashboard.service";
import type { DashboardStatsResponse } from "@/features/dashboard/types/dashboard.types";
import { showErrorToast } from "@/lib/toast";

interface UseDashboardReturn {
  stats: DashboardStatsResponse | null;
  isLoading: boolean;
  error: string | null;
  isEmpty: boolean;
  refetch: () => Promise<void>;
}

export function useDashboard(enabled = true): UseDashboardReturn {
  const [stats, setStats] = useState<DashboardStatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await dashboardService.getStats();
      setStats(response);
    } catch (err) {
      const message =
        (err as { message?: string })?.message ||
        "Failed to load dashboard data";
      setError(message);
      setStats(null);
      showErrorToast(message);
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const isEmpty =
    !isLoading &&
    !error &&
    enabled &&
    stats !== null &&
    Object.keys(stats.data).length === 0;

  return {
    stats,
    isLoading,
    error,
    isEmpty,
    refetch: fetchStats,
  };
}
