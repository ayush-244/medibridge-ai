import { useCallback, useState } from "react";
import { referralService } from "@/features/referrals/services/referral.service";
import type {
  CreateReferralRequest,
  Referral,
} from "@/features/referrals/types/referral.types";
import { showErrorToast, showSuccessToast } from "@/lib/toast";

interface UseCreateReferralReturn {
  isSubmitting: boolean;
  createReferral: (payload: CreateReferralRequest) => Promise<Referral | null>;
}

export function useCreateReferral(): UseCreateReferralReturn {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createReferral = useCallback(
    async (payload: CreateReferralRequest): Promise<Referral | null> => {
      setIsSubmitting(true);

      try {
        const referral = await referralService.createReferral(payload);
        showSuccessToast("Referral created successfully");
        return referral;
      } catch (err) {
        const message =
          (err as { message?: string })?.message ||
          "Failed to create referral";
        showErrorToast(message);
        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    [],
  );

  return { isSubmitting, createReferral };
}
