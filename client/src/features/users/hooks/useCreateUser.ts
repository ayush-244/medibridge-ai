import { useCallback, useState } from "react";
import { userService } from "@/features/users/services/user.service";
import type {
  CreateUserPayload,
  User,
} from "@/features/users/types/user.types";
import { showErrorToast, showSuccessToast } from "@/lib/toast";

interface UseCreateUserReturn {
  isSubmitting: boolean;
  createUser: (payload: CreateUserPayload) => Promise<User | null>;
}

export function useCreateUser(): UseCreateUserReturn {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createUser = useCallback(async (payload: CreateUserPayload) => {
    setIsSubmitting(true);
    try {
      const user = await userService.create(payload);
      showSuccessToast(`User ${user.name} created successfully`);
      return user;
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
