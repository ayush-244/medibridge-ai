import api from "@/services/api";
import type { ApiResponse } from "@/types/api";
import type { User } from "@/features/users/types/user.types";

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
};
