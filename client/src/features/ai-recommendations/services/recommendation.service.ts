import axios from "axios";
import { AI_BASE_URL } from "@/lib/constants";
import type { ApiResponse } from "@/types/api";
import type {
  SpecialistRecommendation,
  RecommendSpecialistRequest,
} from "@/features/ai-recommendations/types/recommendation.types";

const aiApi = axios.create({
  baseURL: AI_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const recommendationService = {
  async recommendSpecialist(
    payload: RecommendSpecialistRequest,
  ): Promise<SpecialistRecommendation> {
    const { data } = await aiApi.post<ApiResponse<SpecialistRecommendation>>(
      "/recommend-specialist",
      payload,
    );

    if (!data.success || !data.data) {
      throw new Error(
        data.message || "Unable to generate recommendation",
      );
    }

    return data.data;
  },
};
