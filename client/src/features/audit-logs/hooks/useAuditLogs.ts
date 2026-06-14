import { useCallback, useEffect, useState } from "react";
import { activityService } from "@/features/dashboard/services/activity.service";
import type { ActivityLog } from "@/features/dashboard/types/activity.types";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";
import { useSocketEvent } from "@/hooks/useSocketEvent";
import { SOCKET_EVENTS } from "@/types/socket";

interface FetchOptions {
  silent?: boolean;
}

export function useAuditLogs() {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async (options?: FetchOptions) => {
    if (!options?.silent) {
      setIsLoading(true);
    }
    setError(null);

    try {
      const logs = await activityService.getAll();
      setActivities(logs);
    } catch (err) {
      const message =
        (err as { message?: string })?.message || "Failed to load audit logs";
      if (!options?.silent) {
        setError(message);
        setActivities([]);
      }
    } finally {
      if (!options?.silent) {
        setIsLoading(false);
      }
    }
  }, []);

  const debouncedRefetch = useDebouncedCallback(
    () => fetchLogs({ silent: true }),
    500,
  );

  useSocketEvent(SOCKET_EVENTS.DASHBOARD_UPDATED, debouncedRefetch);
  useSocketEvent(SOCKET_EVENTS.USER_CREATED, debouncedRefetch);
  useSocketEvent(SOCKET_EVENTS.USER_UPDATED, debouncedRefetch);
  useSocketEvent(SOCKET_EVENTS.DOCTOR_CREATED, debouncedRefetch);
  useSocketEvent(SOCKET_EVENTS.DOCTOR_UPDATED, debouncedRefetch);
  useSocketEvent(SOCKET_EVENTS.HOSPITAL_UPDATED, debouncedRefetch);
  useSocketEvent(SOCKET_EVENTS.RESERVATION_EXTENDED, debouncedRefetch);
  useSocketEvent(SOCKET_EVENTS.RESERVATION_CANCELLED, debouncedRefetch);
  useSocketEvent(SOCKET_EVENTS.PATIENT_ARRIVED, debouncedRefetch);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return { activities, isLoading, error, refetch: fetchLogs };
}
