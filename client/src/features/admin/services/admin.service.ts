import api from "@/services/api";
import type { ApiResponse } from "@/types/api";
import type { User } from "@/features/users/types/user.types";
import type { Hospital } from "@/features/hospitals/types/hospital.types";

export interface PendingHospital extends Hospital {
  admin?: User;
}

export const adminService = {
  async getPendingUsers(): Promise<User[]> {
    const { data } = await api.get<ApiResponse<User[]>>("/admin/pending-users");

    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to fetch pending users");
    }

    return data.data;
  },

  async approveUser(id: string): Promise<User> {
    const { data } = await api.patch<ApiResponse<User>>(
      `/admin/users/${id}/approve`,
    );

    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to approve user");
    }

    return data.data;
  },

  async getPendingHospitals(): Promise<PendingHospital[]> {
    const { data } = await api.get<ApiResponse<PendingHospital[]>>(
      "/admin/pending-hospitals",
    );

    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to fetch pending hospitals");
    }

    return data.data;
  },

  async getPendingHospitalAdmins(): Promise<User[]> {
    const { data } = await api.get<ApiResponse<User[]>>(
      "/admin/pending-hospital-admins",
    );

    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to fetch pending hospital admins");
    }

    return data.data;
  },

  async approveHospital(userId: string): Promise<void> {
    const { data } = await api.post<ApiResponse>(
      `/admin/approve-hospital/${userId}`,
    );

    if (!data.success) {
      throw new Error(data.message || "Failed to approve hospital");
    }
  },

  async rejectHospital(userId: string): Promise<void> {
    const { data } = await api.post<ApiResponse>(
      `/admin/reject-hospital/${userId}`,
    );

    if (!data.success) {
      throw new Error(data.message || "Failed to reject hospital");
    }
  },

  async approveHospitalAdmin(userId: string): Promise<void> {
    const { data } = await api.post<ApiResponse>(
      `/admin/approve-hospital-admin/${userId}`,
    );

    if (!data.success) {
      throw new Error(data.message || "Failed to approve hospital admin");
    }
  },

  async rejectHospitalAdmin(userId: string): Promise<void> {
    const { data } = await api.post<ApiResponse>(
      `/admin/reject-hospital-admin/${userId}`,
    );

    if (!data.success) {
      throw new Error(data.message || "Failed to reject hospital admin");
    }
  },
};
