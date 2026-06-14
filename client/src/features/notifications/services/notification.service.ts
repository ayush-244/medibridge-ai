import api from "@/services/api";
import type { ApiResponse } from "@/types/api";
import type { Notification } from "@/features/notifications/types/notification.types";

export const notificationService = {
  async getAll(): Promise<Notification[]> {
    const { data } = await api.get<ApiResponse<Notification[]>>("/notifications");

    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to load notifications");
    }

    return data.data;
  },

  async markAsRead(id: string): Promise<Notification> {
    const { data } = await api.patch<ApiResponse<Notification>>(
      `/notifications/${id}/read`,
    );

    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to mark notification as read");
    }

    return data.data;
  },
};
