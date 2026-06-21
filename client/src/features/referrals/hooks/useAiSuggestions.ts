import { useCallback, useState } from "react";
import { referralRecommendationsService } from "@/features/referrals/services/referralRecommendations.service";
import type { SpecialistRecommendation } from "@/features/ai-recommendations/types/recommendation.types";
import type { HospitalMatchResult } from "@/types/recommendation.types";

interface AiState {
  isGenerating: boolean;
  specialist: (SpecialistRecommendation & { source?: string }) | null;
  hospitals: HospitalMatchResult | null;
  error: string | null;
}

interface DocumentUploadState {
  progress: number;
  isUploading: boolean;
  error: string | null;
  uploadedFileName: string | null;
}

export function useAiSuggestions(tempId: string) {
  const [aiState, setAiState] = useState<AiState>({
    isGenerating: false,
    specialist: null,
    hospitals: null,
    error: null,
  });

  const [docState, setDocState] = useState<DocumentUploadState>({
    progress: 0,
    isUploading: false,
    error: null,
    uploadedFileName: null,
  });

  const generateSuggestions = useCallback(
    async (params: {
      patientName: string;
      age: string;
      condition: string;
      originHospitalId: string;
    }) => {
      setAiState((prev) => ({
        ...prev,
        isGenerating: true,
        error: null,
      }));

      const age = params.age.trim() ? Number(params.age) : 0;
      const condition = params.condition || params.patientName;

      try {
        const results = await Promise.allSettled([
          referralRecommendationsService.getAiSpecialist({
            patientId: tempId,
            patientName: params.patientName,
            age,
            condition,
          }),
          referralRecommendationsService.getAiHospitals({
            patientId: tempId,
            originHospitalId: params.originHospitalId,
          }),
        ]);

        const specialistResult =
          results[0].status === "fulfilled"
            ? results[0].value
            : null;

        const hospitalResult =
          results[1].status === "fulfilled"
            ? results[1].value
            : null;

        const firstError =
          results[0].status === "rejected"
            ? results[0].reason
            : results[1].status === "rejected"
              ? results[1].reason
              : null;

        const message =
          !specialistResult && !hospitalResult
            ? firstError instanceof Error
              ? firstError.message
              : "Failed to generate AI suggestions"
            : null;

        setAiState({
          isGenerating: false,
          specialist: specialistResult,
          hospitals: hospitalResult,
          error: message,
        });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to generate AI suggestions";
        setAiState((prev) => ({
          ...prev,
          isGenerating: false,
          error: message,
        }));
      }
    },
    [tempId],
  );

  const uploadDocument = useCallback(
    async (file: File) => {
      setDocState({
        progress: 0,
        isUploading: true,
        error: null,
        uploadedFileName: null,
      });

      try {
        const result =
          await referralRecommendationsService.uploadTempDocument(
            tempId,
            file,
            (percent) => {
              setDocState((prev) => ({ ...prev, progress: percent }));
            },
          );

        setDocState({
          progress: 100,
          isUploading: false,
          error: null,
          uploadedFileName: result.filename,
        });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to upload document";
        setDocState((prev) => ({
          ...prev,
          isUploading: false,
          error: message,
        }));
      }
    },
    [tempId],
  );

  const resetUpload = useCallback(() => {
    setDocState({
      progress: 0,
      isUploading: false,
      error: null,
      uploadedFileName: null,
    });
  }, []);

  const clearSuggestions = useCallback(() => {
    setAiState({
      isGenerating: false,
      specialist: null,
      hospitals: null,
      error: null,
    });
  }, []);

  return {
    ...aiState,
    ...docState,
    docError: docState.error,
    generateSuggestions,
    uploadDocument,
    resetUpload,
    clearSuggestions,
  };
}
