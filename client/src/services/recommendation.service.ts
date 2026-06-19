import axios from "axios";
import { AI_BASE_URL } from "@/lib/constants";
import type { ApiResponse } from "@/types/api";
import type {
  HospitalMatchRequest,
  HospitalMatchResult,
} from "@/types/recommendation.types";

const aiApi = axios.create({
  baseURL: AI_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const recommendationService = {
  async matchHospitals(
    payload: HospitalMatchRequest,
  ): Promise<HospitalMatchResult> {
    const { data } = await aiApi.post<ApiResponse<HospitalMatchResult>>(
      "/hospital-match",
      payload,
    );

    if (!data.success || !data.data) {
      throw new Error(data.message || "Unable to fetch hospital recommendations");
    }

    return data.data;
  },
};
