import { useCallback, useEffect, useState } from "react";
import { doctorService } from "@/features/doctors/services/doctor.service";
import type { PendingDoctorUser } from "@/features/doctors/types/doctor.types";
import { showErrorToast, showSuccessToast } from "@/lib/toast";

export function usePendingDoctors() {
  const [doctors, setDoctors] = useState<PendingDoctorUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await doctorService.getPending();
      setDoctors(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load pending doctors",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const approveDoctor = useCallback(
    async (userId: string, name: string) => {
      setActionId(userId);
      try {
        await doctorService.approve(userId);
        showSuccessToast(`Dr. ${name} approved`);
        await refetch();
      } catch (err) {
        showErrorToast(
          err instanceof Error ? err.message : "Failed to approve doctor",
        );
      } finally {
        setActionId(null);
      }
    },
    [refetch],
  );

  const rejectDoctor = useCallback(
    async (userId: string, name: string) => {
      setActionId(userId);
      try {
        await doctorService.reject(userId);
        showSuccessToast(`Dr. ${name} rejected`);
        await refetch();
      } catch (err) {
        showErrorToast(
          err instanceof Error ? err.message : "Failed to reject doctor",
        );
      } finally {
        setActionId(null);
      }
    },
    [refetch],
  );

  return {
    doctors,
    isLoading,
    error,
    actionId,
    approveDoctor,
    rejectDoctor,
    refetch,
  };
}
