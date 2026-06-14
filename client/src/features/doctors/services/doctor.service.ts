import api from "@/services/api";
import type { ApiResponse } from "@/types/api";
import type {
  CreateDoctorPayload,
  Doctor,
  UpdateDoctorPayload,
} from "@/features/doctors/types/doctor.types";

export const doctorService = {
  async getAll(): Promise<Doctor[]> {
    const { data } = await api.get<ApiResponse<Doctor[]>>("/doctors");

    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to fetch doctors");
    }

    return data.data;
  },

  async getByHospital(hospitalId: string): Promise<Doctor[]> {
    const { data } = await api.get<ApiResponse<Doctor[]>>(
      `/doctors/hospital/${hospitalId}`,
    );

    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to fetch doctors");
    }

    return data.data;
  },

  async create(payload: CreateDoctorPayload): Promise<Doctor> {
    const { data } = await api.post<ApiResponse<Doctor>>("/doctors", payload);

    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to create doctor");
    }

    return data.data;
  },

  async update(id: string, payload: UpdateDoctorPayload): Promise<Doctor> {
    const { data } = await api.patch<ApiResponse<Doctor>>(
      `/doctors/${id}`,
      payload,
    );

    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to update doctor");
    }

    return data.data;
  },
};
