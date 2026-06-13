import { useCallback, useState } from "react";
import { REFERRAL_VIEW_STORAGE_KEY } from "@/lib/constants";
import type { ReferralViewMode } from "@/features/referrals/types/referral.types";

export function useReferralView() {
  const [viewMode, setViewModeState] = useState<ReferralViewMode>(() => {
    const stored = localStorage.getItem(REFERRAL_VIEW_STORAGE_KEY);
    return stored === "kanban" ? "kanban" : "table";
  });

  const setViewMode = useCallback((mode: ReferralViewMode) => {
    setViewModeState(mode);
    localStorage.setItem(REFERRAL_VIEW_STORAGE_KEY, mode);
  }, []);

  return { viewMode, setViewMode };
}
