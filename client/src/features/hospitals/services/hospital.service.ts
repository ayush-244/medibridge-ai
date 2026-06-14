import api from "@/services/api";
import type { ApiResponse } from "@/types/api";
import type {
  CreateHospitalPayload,
  Hospital,
  NearbyHospital,
  NearbyHospitalsQuery,
  UpdateBedsPayload,
  UpdateHospitalPayload,
} from "@/features/hospitals/types/hospital.types";

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

  async create(payload: CreateHospitalPayload): Promise<Hospital> {
    const { data } = await api.post<ApiResponse<Hospital>>(
      "/hospitals",
      payload,
    );

    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to create hospital");
    }

    return data.data;
  },

  async update(id: string, payload: UpdateHospitalPayload): Promise<Hospital> {
    const { data } = await api.patch<ApiResponse<Hospital>>(
      `/hospitals/${id}`,
      payload,
    );

    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to update hospital");
    }

    return data.data;
  },

  async updateBeds(id: string, payload: UpdateBedsPayload): Promise<Hospital> {
    const { data } = await api.patch<ApiResponse<Hospital>>(
      `/hospitals/${id}/beds`,
      payload,
    );

    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to update bed availability");
    }

    return data.data;
  },

  async getNearby(params: NearbyHospitalsQuery): Promise<NearbyHospital[]> {
    const { data } = await api.get<ApiResponse<NearbyHospital[]>>(
      "/hospitals/nearby",
      { params },
    );

    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to fetch nearby hospitals");
    }

    return data.data;
  },

  async uploadLogo(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("logo", file);

    const { data } = await api.post<{
      success?: boolean;
      url?: string;
      message?: string;
    }>("/upload/hospital-logo", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (!data.url) {
      throw new Error(data.message || "Failed to upload hospital logo");
    }

    return data.url;
  },
};
