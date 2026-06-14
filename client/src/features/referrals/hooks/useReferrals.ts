import { useCallback, useEffect, useState } from "react";
import type { ReferralStatus } from "@/lib/constants";
import { referralService } from "@/features/referrals/services/referral.service";
import type {
  Referral,
  ReferralAction,
} from "@/features/referrals/types/referral.types";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";
import { useSocketEvent } from "@/hooks/useSocketEvent";
import { showErrorToast, showSuccessToast } from "@/lib/toast";
import { SOCKET_EVENTS } from "@/types/socket";

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

interface FetchOptions {
  silent?: boolean;
}

interface UseReferralsReturn {
  referrals: Referral[];
  isLoading: boolean;
  error: string | null;
  actionLoading: ReferralAction | null;
  refetch: (options?: FetchOptions) => Promise<void>;
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

  const fetchReferrals = useCallback(async (options?: FetchOptions) => {
    if (!options?.silent) {
      setIsLoading(true);
    }
    setError(null);

    try {
      const data = await referralService.getAll();
      setReferrals(data);
    } catch (err) {
      const message =
        (err as { message?: string })?.message || "Failed to load referrals";
      if (!options?.silent) {
        setError(message);
        setReferrals([]);
        showErrorToast(message);
      }
    } finally {
      if (!options?.silent) {
        setIsLoading(false);
      }
    }
  }, []);

  const debouncedRefetch = useDebouncedCallback(
    () => fetchReferrals({ silent: true }),
    500,
  );

  useSocketEvent(SOCKET_EVENTS.REFERRAL_ACCEPTED, debouncedRefetch);
  useSocketEvent(SOCKET_EVENTS.DOCTOR_ASSIGNED, debouncedRefetch);

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
        await fetchReferrals({ silent: true });
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
