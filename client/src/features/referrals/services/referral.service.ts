import api from "@/services/api";
import type { ApiResponse } from "@/types/api";
import type {
  Referral,
  ReferralQueryParams,
  CreateReferralRequest,
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
};
