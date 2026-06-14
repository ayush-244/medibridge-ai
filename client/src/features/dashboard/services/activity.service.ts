import api from "@/services/api";
import type { ApiResponse } from "@/types/api";
import type { ActivityLog } from "@/features/dashboard/types/activity.types";

export const activityService = {
  async getAll(): Promise<ActivityLog[]> {
    const { data } = await api.get<ApiResponse<ActivityLog[]>>("/activities");

    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to load activities");
    }

    return data.data;
  },
};
