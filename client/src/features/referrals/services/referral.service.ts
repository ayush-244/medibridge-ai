import api from "@/services/api";
import type { ApiResponse } from "@/types/api";
import type {
  Referral,
  ReferralQueryParams,
  CreateReferralRequest,
  TimelineEventItem,
  ReferralDocument,
} from "@/features/referrals/types/referral.types";

export const referralService = {
  async getAll(params?: ReferralQueryParams): Promise<Referral[]> {
    const { data } = await api.get<ApiResponse<Referral[]>>("/referrals", {
      params,
    });

    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to fetch referrals");
    }

    return data.data;
  },

  async createReferral(payload: CreateReferralRequest): Promise<Referral> {
    const { data } = await api.post<ApiResponse<Referral>>(
      "/referrals",
      payload,
    );

    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to create referral");
    }

    return data.data;
  },

  async accept(id: string): Promise<void> {
    const { data } = await api.patch<ApiResponse>(`/referrals/${id}/accept`);

    if (!data.success) {
      throw new Error(data.message || "Failed to accept referral");
    }
  },

  async reject(id: string): Promise<Referral> {
    const { data } = await api.patch<ApiResponse<Referral>>(
      `/referrals/${id}/reject`,
    );

    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to reject referral");
    }

    return data.data;
  },

  async complete(id: string): Promise<Referral> {
    const { data } = await api.patch<ApiResponse<Referral>>(
      `/referrals/${id}/complete`,
    );

    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to complete referral");
    }

    return data.data;
  },

  async getTimeline(id: string): Promise<TimelineEventItem[]> {
    const { data } = await api.get<ApiResponse<TimelineEventItem[]>>(
      `/referrals/${id}/timeline`,
    );

    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to fetch timeline");
    }

    return data.data;
  },

  async getDocuments(id: string): Promise<ReferralDocument[]> {
    const { data } = await api.get<ApiResponse<ReferralDocument[]>>(
      `/referrals/${id}/documents`,
    );

    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to fetch documents");
    }

    return data.data;
  },

  async uploadDocument(id: string, file: File): Promise<ReferralDocument> {
    const formData = new FormData();
    formData.append("file", file);

    const { data } = await api.post<ApiResponse<ReferralDocument>>(
      `/referrals/${id}/documents`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 120000,
      },
    );

    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to upload document");
    }

    return data.data;
  },

  async deleteDocument(id: string, documentId: string): Promise<void> {
    const { data } = await api.delete<ApiResponse>(
      `/referrals/${id}/documents/${documentId}`,
    );

    if (!data.success) {
      throw new Error(data.message || "Failed to delete document");
    }
  },

  async replaceDocument(
    id: string,
    documentId: string,
    file: File,
  ): Promise<ReferralDocument> {
    const formData = new FormData();
    formData.append("file", file);

    const { data } = await api.put<ApiResponse<ReferralDocument>>(
      `/referrals/${id}/documents/${documentId}/replace`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 120000,
      },
    );

    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to replace document");
    }

    return data.data;
  },

  getDocumentDownloadUrl(id: string, documentId: string): string {
    const baseUrl = api.defaults.baseURL || "";
    return `${baseUrl}/referrals/${id}/documents/${documentId}/download`;
  },
};
