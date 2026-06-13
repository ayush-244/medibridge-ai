import api from "@/services/api";
import type { ApiResponse } from "@/types/api";
import type { Doctor } from "@/features/doctors/types/doctor.types";

export const doctorService = {
  async getAll(): Promise<Doctor[]> {
    const { data } = await api.get<ApiResponse<Doctor[]>>("/doctors");

    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to fetch doctors");
    }

    return data.data;
  },
};
