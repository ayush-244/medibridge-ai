import { useCallback, useEffect, useState } from "react";
import { adminService } from "@/features/admin/services/admin.service";
import type { User } from "@/features/users/types/user.types";
import { showErrorToast, showSuccessToast } from "@/lib/toast";

export function usePendingUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const fetchPending = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminService.getPendingUsers();
      setUsers(data);
    } catch (err) {
      const message =
        (err as { message?: string })?.message ||
        "Failed to load pending users";
      setError(message);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  const approveUser = useCallback(
    async (id: string, name: string) => {
      setApprovingId(id);
      try {
        await adminService.approveUser(id);
        setUsers((prev) => prev.filter((user) => user._id !== id));
        showSuccessToast(`${name} approved successfully`);
        return true;
      } catch (err) {
        showErrorToast(
          (err as { message?: string })?.message || "Failed to approve user",
        );
        return false;
      } finally {
        setApprovingId(null);
      }
    },
    [],
  );

  return {
    users,
    isLoading,
    error,
    approvingId,
    refetch: fetchPending,
    approveUser,
  };
}
