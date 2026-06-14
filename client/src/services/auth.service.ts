import api from "@/services/api";
import type { ApiResponse } from "@/types/api";
import type {
  AuthUser,
  ChangePasswordPayload,
  LoginCredentials,
  NotificationPreferences,
  UpdateProfilePayload,
} from "@/types/auth";

interface LoginResponse {
  token: string;
}

interface ProfileResponse {
  user: AuthUser;
}

interface UploadUserPhotoResponse {
  success?: boolean;
  url?: string;
  message?: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<string> {
    const { data } = await api.post<ApiResponse & LoginResponse>(
      "/auth/login",
      credentials,
    );

    if (!data.success || !data.token) {
      throw new Error(data.message || "Login failed");
    }

    return data.token;
  },

  async getProfile(): Promise<AuthUser> {
    const { data } = await api.get<ApiResponse & ProfileResponse>(
      "/auth/profile",
    );

    if (!data.success || !data.user) {
      throw new Error(data.message || "Failed to fetch profile");
    }

    return data.user;
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<AuthUser> {
    const { data } = await api.patch<ApiResponse<AuthUser>>(
      "/auth/profile",
      payload,
    );

    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to update profile");
    }

    return data.data;
  },

  async uploadUserPhoto(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("photo", file);

    const { data } = await api.post<UploadUserPhotoResponse>(
      "/upload/user-photo",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    if (!data.url) {
      throw new Error(data.message || "Failed to upload profile photo");
    }

    return data.url;
  },

  async changePassword(payload: ChangePasswordPayload): Promise<void> {
    const { data } = await api.patch<ApiResponse>("/auth/password", payload);

    if (!data.success) {
      throw new Error(data.message || "Failed to change password");
    }
  },

  async updateNotificationPreferences(
    preferences: Partial<NotificationPreferences>,
  ): Promise<NotificationPreferences> {
    const { data } = await api.patch<ApiResponse<NotificationPreferences>>(
      "/auth/notification-preferences",
      preferences,
    );

    if (!data.success || !data.data) {
      throw new Error(
        data.message || "Failed to update notification preferences",
      );
    }

    return data.data;
  },
};
