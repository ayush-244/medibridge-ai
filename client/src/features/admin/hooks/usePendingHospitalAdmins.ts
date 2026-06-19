import { useCallback, useEffect, useState } from "react";
import { adminService } from "@/features/admin/services/admin.service";
import type { User } from "@/features/users/types/user.types";
import { showErrorToast, showSuccessToast } from "@/lib/toast";

export function usePendingHospitalAdmins() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminService.getPendingHospitalAdmins();
      setUsers(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load pending hospital admins",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const approveAdmin = useCallback(
    async (userId: string, name: string) => {
      setActionId(userId);
      try {
        await adminService.approveHospitalAdmin(userId);
        showSuccessToast(`${name} approved`);
        await refetch();
      } catch (err) {
        showErrorToast(
          err instanceof Error ? err.message : "Failed to approve hospital admin",
        );
      } finally {
        setActionId(null);
      }
    },
    [refetch],
  );

  const rejectAdmin = useCallback(
    async (userId: string, name: string) => {
      setActionId(userId);
      try {
        await adminService.rejectHospitalAdmin(userId);
        showSuccessToast(`${name} rejected`);
        await refetch();
      } catch (err) {
        showErrorToast(
          err instanceof Error ? err.message : "Failed to reject hospital admin",
        );
      } finally {
        setActionId(null);
      }
    },
    [refetch],
  );

  return {
    users,
    isLoading,
    error,
    actionId,
    approveAdmin,
    rejectAdmin,
    refetch,
  };
}
