import api from "@/services/api";
import type { ApiResponse } from "@/types/api";
import type { DashboardStatsResponse } from "@/features/dashboard/types/dashboard.types";

export const dashboardService = {
  async getStats(): Promise<DashboardStatsResponse> {
    const { data } = await api.get<ApiResponse & DashboardStatsResponse>(
      "/dashboard/stats",
    );

    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to load dashboard stats");
    }

    return {
      success: data.success,
      role: data.role,
      hospital: data.hospital,
      data: data.data,
    };
  },
};
