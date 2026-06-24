import { useCallback, useState } from "react";
import { referralAutofillService } from "@/features/referral-autofill/services/referralAutofill.service";
import type { ReferralAutofillData } from "@/features/referral-autofill/types/referralAutofill.types";

interface AutofillState {
  isExtracting: boolean;
  data: ReferralAutofillData | null;
  error: string | null;
  isApplied: boolean;
}

export function useReferralAutofill(tempId: string) {
  const [state, setState] = useState<AutofillState>({
    isExtracting: false,
    data: null,
    error: null,
    isApplied: false,
  });

  const extract = useCallback(async () => {
    setState({
      isExtracting: true,
      data: null,
      error: null,
      isApplied: false,
    });

    try {
      const result = await referralAutofillService.extractReferralData(tempId);

      setState({
        isExtracting: false,
        data: result,
        error: null,
        isApplied: false,
      });
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to extract patient information from this document.";
      setState({
        isExtracting: false,
        data: null,
        error: message,
        isApplied: false,
      });
    }
  }, [tempId]);

  const markApplied = useCallback(() => {
    setState((prev) => ({ ...prev, isApplied: true }));
  }, []);

  const discard = useCallback(() => {
    setState({
      isExtracting: false,
      data: null,
      error: null,
      isApplied: false,
    });
  }, []);

  const reset = useCallback(() => {
    setState({
      isExtracting: false,
      data: null,
      error: null,
      isApplied: false,
    });
  }, []);

  return {
    ...state,
    extract,
    markApplied,
    discard,
    reset,
  };
}
