import { useCallback, useEffect, useState } from "react";
import type { ReferralStatus } from "@/lib/constants";
import { referralService } from "@/features/referrals/services/referral.service";
import type {
  Referral,
  ReferralAction,
} from "@/features/referrals/types/referral.types";
import { showErrorToast, showSuccessToast } from "@/lib/toast";

const actionStatusMap: Record<ReferralAction, ReferralStatus> = {
  accept: "ACCEPTED",
  reject: "REJECTED",
  complete: "COMPLETED",
};

const actionMessages: Record<ReferralAction, string> = {
  accept: "Referral accepted successfully",
  reject: "Referral rejected",
  complete: "Referral marked as completed",
};

interface UseReferralsReturn {
  referrals: Referral[];
  isLoading: boolean;
  error: string | null;
  actionLoading: ReferralAction | null;
  refetch: () => Promise<void>;
  performAction: (id: string, action: ReferralAction) => Promise<boolean>;
  updateReferral: (referral: Referral) => void;
}

export function useReferrals(): UseReferralsReturn {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<ReferralAction | null>(
    null,
  );

  const fetchReferrals = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await referralService.getAll();
      setReferrals(data);
    } catch (err) {
      const message =
        (err as { message?: string })?.message || "Failed to load referrals";
      setError(message);
      setReferrals([]);
      showErrorToast(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReferrals();
  }, [fetchReferrals]);

  const updateReferral = useCallback((referral: Referral) => {
    setReferrals((prev) =>
      prev.map((r) => (r._id === referral._id ? referral : r)),
    );
  }, []);

  const performAction = useCallback(
    async (id: string, action: ReferralAction): Promise<boolean> => {
      const previous = referrals;
      const targetStatus = actionStatusMap[action];

      setReferrals((prev) =>
        prev.map((r) =>
          r._id === id ? { ...r, status: targetStatus } : r,
        ),
      );
      setActionLoading(action);

      try {
        if (action === "accept") {
          await referralService.accept(id);
        } else if (action === "reject") {
          const updated = await referralService.reject(id);
          setReferrals((prev) =>
            prev.map((r) => (r._id === id ? { ...r, ...updated } : r)),
          );
        } else {
          const updated = await referralService.complete(id);
          setReferrals((prev) =>
            prev.map((r) => (r._id === id ? { ...r, ...updated } : r)),
          );
        }

        showSuccessToast(actionMessages[action]);
        await fetchReferrals();
        return true;
      } catch (err) {
        setReferrals(previous);
        const message =
          (err as { message?: string })?.message ||
          `Failed to ${action} referral`;
        showErrorToast(message);
        return false;
      } finally {
        setActionLoading(null);
      }
    },
    [referrals, fetchReferrals],
  );

  return {
    referrals,
    isLoading,
    error,
    actionLoading,
    refetch: fetchReferrals,
    performAction,
    updateReferral,
  };
}
