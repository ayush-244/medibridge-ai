import { useCallback, useEffect, useState } from "react";
import { userService } from "@/features/users/services/user.service";
import type { User } from "@/features/users/types/user.types";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";
import { useSocketEvent } from "@/hooks/useSocketEvent";
import { showErrorToast } from "@/lib/toast";
import { SOCKET_EVENTS } from "@/types/socket";

interface FetchOptions {
  silent?: boolean;
}

interface UseUsersReturn {
  users: User[];
  isLoading: boolean;
  error: string | null;
  refetch: (options?: FetchOptions) => Promise<void>;
}

export function useUsers(): UseUsersReturn {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async (options?: FetchOptions) => {
    if (!options?.silent) {
      setIsLoading(true);
    }
    setError(null);

    try {
      const data = await userService.getAll();
      setUsers(data);
    } catch (err) {
      const message =
        (err as { message?: string })?.message || "Failed to load users";
      if (!options?.silent) {
        setError(message);
        setUsers([]);
        showErrorToast(message);
      }
    } finally {
      if (!options?.silent) {
        setIsLoading(false);
      }
    }
  }, []);

  const debouncedRefetch = useDebouncedCallback(
    () => fetchUsers({ silent: true }),
    500,
  );

  useSocketEvent(SOCKET_EVENTS.USER_CREATED, debouncedRefetch);
  useSocketEvent(SOCKET_EVENTS.USER_UPDATED, debouncedRefetch);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { users, isLoading, error, refetch: fetchUsers };
}
