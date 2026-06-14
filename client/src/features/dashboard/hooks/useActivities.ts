import { useCallback, useEffect, useState } from "react";
import { activityService } from "@/features/dashboard/services/activity.service";
import type { ActivityItem } from "@/features/dashboard/types/dashboard.types";
import { mapActivityLogs } from "@/features/dashboard/utils/activityMappers";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";
import { useSocketEvent } from "@/hooks/useSocketEvent";
import { SOCKET_EVENTS } from "@/types/socket";

interface FetchOptions {
  silent?: boolean;
}

interface UseActivitiesReturn {
  activities: ActivityItem[];
  isLoading: boolean;
  error: string | null;
  refetch: (options?: FetchOptions) => Promise<void>;
}

export function useActivities(enabled = true): UseActivitiesReturn {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = useCallback(
    async (options?: FetchOptions) => {
      if (!enabled) {
        setIsLoading(false);
        return;
      }

      if (!options?.silent) {
        setIsLoading(true);
      }
      setError(null);

      try {
        const logs = await activityService.getAll();
        setActivities(mapActivityLogs(logs));
      } catch (err) {
        const message =
          (err as { message?: string })?.message ||
          "Failed to load activity feed";
        if (!options?.silent) {
          setError(message);
        }
      } finally {
        if (!options?.silent) {
          setIsLoading(false);
        }
      }
    },
    [enabled],
  );

  const debouncedRefetch = useDebouncedCallback(
    () => fetchActivities({ silent: true }),
    500,
  );

  useSocketEvent(SOCKET_EVENTS.REFERRAL_ACCEPTED, debouncedRefetch, enabled);
  useSocketEvent(SOCKET_EVENTS.BED_RESERVED, debouncedRefetch, enabled);
  useSocketEvent(SOCKET_EVENTS.RESERVATION_EXPIRED, debouncedRefetch, enabled);
  useSocketEvent(SOCKET_EVENTS.DOCTOR_ASSIGNED, debouncedRefetch, enabled);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  return {
    activities,
    isLoading,
    error,
    refetch: fetchActivities,
  };
}
