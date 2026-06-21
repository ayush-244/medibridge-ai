import api from "@/services/api";
import type { ApiResponse } from "@/types/api";
import type { SpecialistRecommendation } from "@/features/ai-recommendations/types/recommendation.types";
import type { HospitalMatchResult } from "@/types/recommendation.types";

interface UploadResult {
  filename: string;
  chunks_stored: number;
  patient_id: string | null;
  uploaded_by: string | null;
}

interface ReScopeResult {
  documentsReassigned?: number;
  documents_reassigned?: number;
}

/**
 * Referral-scoped recommendation service.
 *
 * All calls go through the Node BFF (/api/referrals/:id/recommendations/*).
 * The frontend never sends patient_id, MongoDB ObjectIds, or any
 * manual identifiers — the BFF derives everything from the referralId.
 */
export const referralRecommendationsService = {
  /**
   * Generate a specialist recommendation for an open referral.
   * Falls back to referral clinical data when no documents exist in ChromaDB.
   */
  async generateSpecialistRecommendation(
    referralId: string,
  ): Promise<SpecialistRecommendation & { source?: string }> {
    const { data } = await api.post<
      ApiResponse<SpecialistRecommendation & { source?: string }>
    >(`/referrals/${referralId}/recommendations/specialist`);

    if (!data.success || !data.data) {
      throw new Error(
        data.message || "Unable to generate specialist recommendation",
      );
    }

    return data.data;
  },

  /**
   * Generate ranked hospital recommendations for an open referral.
   * Uses specialist recommendation internally via the AI service fallback.
   */
  async generateHospitalRecommendations(
    referralId: string,
  ): Promise<HospitalMatchResult> {
    const { data } = await api.post<ApiResponse<HospitalMatchResult>>(
      `/referrals/${referralId}/recommendations/hospitals`,
    );

    if (!data.success || !data.data) {
      throw new Error(
        data.message || "Unable to generate hospital recommendations",
      );
    }

    return data.data;
  },

  async uploadDocument(
    referralId: string,
    file: File,
    onProgress?: (percent: number) => void,
  ): Promise<UploadResult> {
    const formData = new FormData();
    formData.append("file", file);

    const { data } = await api.post<ApiResponse<UploadResult>>(
      `/referrals/${referralId}/documents/upload`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (event) => {
          if (onProgress && event.total) {
            onProgress(Math.round((event.loaded / event.total) * 100));
          }
        },
      },
    );

    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to upload document");
    }

    return data.data;
  },

  async getAiSpecialist(params: {
    patientId: string;
    patientName?: string;
    age?: number;
    condition?: string;
  }): Promise<SpecialistRecommendation & { source?: string }> {
    const { data } = await api.post<
      ApiResponse<SpecialistRecommendation & { source?: string }>
    >("/referrals/ai-specialist", params);

    if (!data.success || !data.data) {
      throw new Error(
        data.message || "Unable to generate specialist recommendation",
      );
    }

    return data.data;
  },

  async getAiHospitals(params: {
    patientId: string;
    originHospitalId: string;
  }): Promise<HospitalMatchResult> {
    const { data } = await api.post<ApiResponse<HospitalMatchResult>>(
      "/referrals/ai-hospitals",
      params,
    );

    if (!data.success || !data.data) {
      throw new Error(
        data.message || "Unable to generate hospital recommendations",
      );
    }

    return data.data;
  },

  async uploadTempDocument(
    patientId: string,
    file: File,
    onProgress?: (percent: number) => void,
  ): Promise<UploadResult> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("patientId", patientId);

    const { data } = await api.post<ApiResponse<UploadResult>>(
      "/documents/upload-temp",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (event) => {
          if (onProgress && event.total) {
            onProgress(Math.round((event.loaded / event.total) * 100));
          }
        },
      },
    );

    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to upload document");
    }

    return data.data;
  },

  async reScopeDocuments(params: {
    fromPatientId: string;
    toPatientId: string;
  }): Promise<ReScopeResult> {
    const { data } = await api.post<ApiResponse<ReScopeResult>>(
      "/documents/re-scope",
      params,
    );

    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to reassign documents");
    }

    return data.data;
  },
};
