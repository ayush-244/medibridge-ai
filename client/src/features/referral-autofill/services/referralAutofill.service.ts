import api from "@/services/api";
import type { ApiResponse } from "@/types/api";
import type { ReferralAutofillData } from "@/features/referral-autofill/types/referralAutofill.types";

export const referralAutofillService = {
  async extractReferralData(
    patientId: string,
  ): Promise<ReferralAutofillData> {
    const { data } = await api.post<ApiResponse<ReferralAutofillData>>(
      "/referrals/extract",
      { patientId },
    );

    if (!data.success || !data.data) {
      throw new Error(
        data.message || "Unable to extract patient information from this document.",
      );
    }

    return data.data;
  },
};
