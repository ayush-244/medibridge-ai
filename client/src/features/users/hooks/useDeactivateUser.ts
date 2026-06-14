import { useCallback, useState } from "react";
import { userService } from "@/features/users/services/user.service";
import { showErrorToast, showSuccessToast } from "@/lib/toast";

interface UseDeactivateUserReturn {
  isDeactivating: boolean;
  deactivateUser: (id: string, name: string) => Promise<boolean>;
}

export function useDeactivateUser(): UseDeactivateUserReturn {
  const [isDeactivating, setIsDeactivating] = useState(false);

  const deactivateUser = useCallback(async (id: string, name: string) => {
    setIsDeactivating(true);
    try {
      await userService.deactivate(id);
      showSuccessToast(`User ${name} deactivated`);
      return true;
    } catch (err) {
      const message =
        (err as { message?: string })?.message || "Failed to deactivate user";
      showErrorToast(message);
      return false;
    } finally {
      setIsDeactivating(false);
    }
  }, []);

  return { isDeactivating, deactivateUser };
}
