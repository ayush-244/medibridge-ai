import api from "@/services/api";
import type { ApiResponse } from "@/types/api";
import type {
  CreateDoctorPayload,
  CreateDoctorResult,
  Doctor,
  PendingDoctorUser,
  UpdateDoctorPayload,
} from "@/features/doctors/types/doctor.types";

interface UploadDoctorPhotoResponse {
  success?: boolean;
  url?: string;
  message?: string;
}

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

  async create(payload: CreateDoctorPayload): Promise<CreateDoctorResult> {
    const { data } = await api.post<ApiResponse<Doctor>>("/doctors", payload);

    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to create doctor");
    }

    return {
      doctor: data.data,
      temporaryPassword: data.temporaryPassword,
    };
  },

  async getPending(): Promise<PendingDoctorUser[]> {
    const { data } = await api.get<ApiResponse<PendingDoctorUser[]>>(
      "/doctors/pending",
    );

    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to fetch pending doctors");
    }

    return data.data;
  },

  async approve(userId: string): Promise<void> {
    const { data } = await api.post<ApiResponse>(`/doctors/approve/${userId}`);

    if (!data.success) {
      throw new Error(data.message || "Failed to approve doctor");
    }
  },

  async reject(userId: string): Promise<void> {
    const { data } = await api.post<ApiResponse>(`/doctors/reject/${userId}`);

    if (!data.success) {
      throw new Error(data.message || "Failed to reject doctor");
    }
  },

  async uploadPhoto(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("photo", file);

    const { data } = await api.post<UploadDoctorPhotoResponse>(
      "/upload/doctor-photo",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    if (!data.url) {
      throw new Error(data.message || "Failed to upload doctor photo");
    }

    return data.url;
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
