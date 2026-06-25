import { useCallback, useEffect, useState } from "react";
import { referralService } from "@/features/referrals/services/referral.service";
import type {
  ReviewData,
  AiSummary,
  SmartAcceptPayload,
} from "@/features/referrals/types/referral.types";

interface UseClinicalReviewReturn {
  reviewData: ReviewData | null;
  aiSummary: AiSummary | null;
  isLoading: boolean;
  isAiLoading: boolean;
  error: string | null;
  aiError: string | null;
  actionLoading: boolean;
  generateAiSummary: () => Promise<void>;
  smartAccept: (payload: SmartAcceptPayload) => Promise<boolean>;
  reject: () => Promise<boolean>;
  refetch: () => Promise<void>;
}

export function useClinicalReview(id: string): UseClinicalReviewReturn {
  const [reviewData, setReviewData] = useState<ReviewData | null>(null);
  const [aiSummary, setAiSummary] = useState<AiSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchReviewData = useCallback(async () => {
    if (!id) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await referralService.getReviewData(id);
      setReviewData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load review data");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  const generateAiSummary = useCallback(async () => {
    if (!id) return;

    setIsAiLoading(true);
    setAiError(null);

    try {
      const summary = await referralService.getAiSummary(id);
      setAiSummary(summary);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "Failed to generate AI summary");
    } finally {
      setIsAiLoading(false);
    }
  }, [id]);

  const smartAccept = useCallback(
    async (payload: SmartAcceptPayload): Promise<boolean> => {
      if (!id) return false;

      setActionLoading(true);

      try {
        await referralService.smartAccept(id, payload);
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to accept referral");
        return false;
      } finally {
        setActionLoading(false);
      }
    },
    [id],
  );

  const reject = useCallback(async (): Promise<boolean> => {
    if (!id) return false;

    setActionLoading(true);

    try {
      await referralService.reject(id);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reject referral");
      return false;
    } finally {
      setActionLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void fetchReviewData();
  }, [fetchReviewData]);

  return {
    reviewData,
    aiSummary,
    isLoading,
    isAiLoading,
    error,
    aiError,
    actionLoading,
    generateAiSummary,
    smartAccept,
    reject,
    refetch: fetchReviewData,
  };
}
