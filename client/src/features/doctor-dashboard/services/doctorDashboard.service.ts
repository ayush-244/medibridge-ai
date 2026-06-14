import api from "@/services/api";
import type { ApiResponse } from "@/types/api";
import type { DoctorDashboardData } from "@/features/doctor-dashboard/types/doctorDashboard.types";

export const doctorDashboardService = {
  async getDashboard(): Promise<DoctorDashboardData> {
    const { data } = await api.get<ApiResponse<DoctorDashboardData>>(
      "/doctor-dashboard",
    );

    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to load doctor dashboard");
    }

    return data.data;
  },
};
