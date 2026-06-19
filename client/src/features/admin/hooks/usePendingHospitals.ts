import { useCallback, useEffect, useState } from "react";
import { adminService } from "@/features/admin/services/admin.service";
import type { PendingHospital } from "@/features/admin/services/admin.service";
import { showErrorToast, showSuccessToast } from "@/lib/toast";

export function usePendingHospitals() {
  const [hospitals, setHospitals] = useState<PendingHospital[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminService.getPendingHospitals();
      setHospitals(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load pending hospitals",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const approveHospital = useCallback(
    async (userId: string, hospitalName: string) => {
      setActionId(userId);
      try {
        await adminService.approveHospital(userId);
        showSuccessToast(`${hospitalName} approved`);
        await refetch();
      } catch (err) {
        showErrorToast(
          err instanceof Error ? err.message : "Failed to approve hospital",
        );
      } finally {
        setActionId(null);
      }
    },
    [refetch],
  );

  const rejectHospital = useCallback(
    async (userId: string, hospitalName: string) => {
      setActionId(userId);
      try {
        await adminService.rejectHospital(userId);
        showSuccessToast(`${hospitalName} rejected`);
        await refetch();
      } catch (err) {
        showErrorToast(
          err instanceof Error ? err.message : "Failed to reject hospital",
        );
      } finally {
        setActionId(null);
      }
    },
    [refetch],
  );

  return {
    hospitals,
    isLoading,
    error,
    actionId,
    approveHospital,
    rejectHospital,
    refetch,
  };
}
