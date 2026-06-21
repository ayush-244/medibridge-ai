import { useCallback, useState } from "react";
import { referralRecommendationsService } from "@/features/referrals/services/referralRecommendations.service";

interface UploadState {
  progress: number;
  isUploading: boolean;
  error: string | null;
  uploadedFileName: string | null;
}

export function useReferralDocumentUpload(referralId: string | null) {
  const [state, setState] = useState<UploadState>({
    progress: 0,
    isUploading: false,
    error: null,
    uploadedFileName: null,
  });

  const upload = useCallback(
    async (file: File) => {
      if (!referralId) return;

      setState({
        progress: 0,
        isUploading: true,
        error: null,
        uploadedFileName: null,
      });

      try {
        const result = await referralRecommendationsService.uploadDocument(
          referralId,
          file,
          (percent) => {
            setState((prev) => ({ ...prev, progress: percent }));
          },
        );

        setState({
          progress: 100,
          isUploading: false,
          error: null,
          uploadedFileName: result.filename,
        });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to upload document";
        setState((prev) => ({
          ...prev,
          isUploading: false,
          error: message,
        }));
      }
    },
    [referralId],
  );

  const reset = useCallback(() => {
    setState({
      progress: 0,
      isUploading: false,
      error: null,
      uploadedFileName: null,
    });
  }, []);

  return { ...state, upload, reset };
}
