import { useCallback, useEffect, useState } from "react";
import { doctorDashboardService } from "@/features/doctor-dashboard/services/doctorDashboard.service";
import type { DoctorDashboardData } from "@/features/doctor-dashboard/types/doctorDashboard.types";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";
import { useSocketEvent } from "@/hooks/useSocketEvent";
import { showErrorToast } from "@/lib/toast";
import { SOCKET_EVENTS } from "@/types/socket";

interface FetchOptions {
  silent?: boolean;
}

export function useDoctorDashboard() {
  const [data, setData] = useState<DoctorDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async (options?: FetchOptions) => {
    if (!options?.silent) {
      setIsLoading(true);
    }
    setError(null);

    try {
      const dashboard = await doctorDashboardService.getDashboard();
      setData(dashboard);
    } catch (err) {
      const message =
        (err as { message?: string })?.message ||
        "Failed to load doctor dashboard";
      if (!options?.silent) {
        setError(message);
        setData(null);
        showErrorToast(message);
      }
    } finally {
      if (!options?.silent) {
        setIsLoading(false);
      }
    }
  }, []);

  const debouncedRefetch = useDebouncedCallback(
    () => fetchDashboard({ silent: true }),
    500,
  );

  useSocketEvent(SOCKET_EVENTS.DOCTOR_ASSIGNED, debouncedRefetch);
  useSocketEvent(SOCKET_EVENTS.PATIENT_ARRIVED, debouncedRefetch);
  useSocketEvent(SOCKET_EVENTS.RESERVATION_EXTENDED, debouncedRefetch);
  useSocketEvent(SOCKET_EVENTS.RESERVATION_CANCELLED, debouncedRefetch);
  useSocketEvent(SOCKET_EVENTS.BED_RESERVED, debouncedRefetch);
  useSocketEvent(SOCKET_EVENTS.DOCTOR_UPDATED, debouncedRefetch);
  useSocketEvent(SOCKET_EVENTS.DASHBOARD_UPDATED, debouncedRefetch);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchDashboard,
  };
}
