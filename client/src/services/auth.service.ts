import api from "@/services/api";
import type { ApiResponse } from "@/types/api";
import type {
  AuthUser,
  ChangePasswordPayload,
  LoginCredentials,
  LoginResult,
  NotificationPreferences,
  RegisterDoctorPayload,
  RegisterHospitalPayload,
  UpdateProfilePayload,
} from "@/types/auth";

interface ProfileResponse {
  user: AuthUser;
}

interface UploadUserPhotoResponse {
  success?: boolean;
  url?: string;
  message?: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResult> {
    const { data } = await api.post<ApiResponse & LoginResult>(
      "/auth/login",
      credentials,
    );

    if (!data.success || !data.token) {
      throw new Error(data.message || "Login failed");
    }

    return {
      token: data.token,
      user: data.user as AuthUser,
      mustChangePassword: Boolean(data.mustChangePassword),
    };
  },

  async registerHospital(payload: RegisterHospitalPayload): Promise<void> {
    const { data } = await api.post<ApiResponse>(
      "/auth/register-hospital",
      payload,
    );

    if (!data.success) {
      throw new Error(data.message || "Hospital registration failed");
    }
  },

  async registerDoctor(payload: RegisterDoctorPayload): Promise<void> {
    const { data } = await api.post<ApiResponse>(
      "/auth/register-doctor",
      payload,
    );

    if (!data.success) {
      throw new Error(data.message || "Doctor registration failed");
    }
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

  async changePassword(
    payload: ChangePasswordPayload,
  ): Promise<{ mustChangePassword: boolean }> {
    const { data } = await api.patch<ApiResponse>("/auth/password", payload);

    if (!data.success) {
      throw new Error(data.message || "Failed to change password");
    }

    return {
      mustChangePassword: Boolean(data.mustChangePassword),
    };
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
