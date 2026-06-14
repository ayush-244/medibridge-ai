import { useCallback, useState } from "react";
import { userService } from "@/features/users/services/user.service";
import type { UserDetail } from "@/features/users/types/user.types";
import { showErrorToast } from "@/lib/toast";

interface UseUserDetailReturn {
  user: UserDetail | null;
  isLoading: boolean;
  fetchUser: (id: string) => Promise<void>;
  clearUser: () => void;
}

export function useUserDetail(): UseUserDetailReturn {
  const [user, setUser] = useState<UserDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUser = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const data = await userService.getById(id);
      setUser(data);
    } catch (err) {
      const message =
        (err as { message?: string })?.message ||
        "Failed to load user details";
      showErrorToast(message);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearUser = useCallback(() => setUser(null), []);

  return { user, isLoading, fetchUser, clearUser };
}
