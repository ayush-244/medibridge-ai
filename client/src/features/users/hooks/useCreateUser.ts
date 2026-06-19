import { useCallback, useState } from "react";
import { userService } from "@/features/users/services/user.service";
import type {
  CreateUserPayload,
  CreateUserResult,
  User,
} from "@/features/users/types/user.types";
import { showErrorToast, showSuccessToast } from "@/lib/toast";

interface UseCreateUserReturn {
  isSubmitting: boolean;
  createUser: (payload: CreateUserPayload) => Promise<CreateUserResult | null>;
}

export function useCreateUser(): UseCreateUserReturn {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createUser = useCallback(async (payload: CreateUserPayload) => {
    setIsSubmitting(true);
    try {
      const result = await userService.create(payload);
      showSuccessToast(`User ${result.user.name} created successfully`);
      return result;
    } catch (err) {
      const message =
        (err as { message?: string })?.message || "Failed to create user";
      showErrorToast(message);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return { isSubmitting, createUser };
}
