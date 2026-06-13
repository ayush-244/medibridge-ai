import api from "@/services/api";
import type { ApiResponse } from "@/types/api";
import type { Hospital } from "@/features/hospitals/types/hospital.types";

export const hospitalService = {
  async getAll(): Promise<Hospital[]> {
    const { data } = await api.get<ApiResponse<Hospital[]>>("/hospitals");

    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to fetch hospitals");
    }

    return data.data;
  },

  async getById(id: string): Promise<Hospital> {
    const { data } = await api.get<ApiResponse<Hospital>>(`/hospitals/${id}`);

    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to fetch hospital details");
    }

    return data.data;
  },
};
