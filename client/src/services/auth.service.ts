import api from "@/services/api";
import type { ApiResponse } from "@/types/api";
import type { AuthUser, LoginCredentials } from "@/types/auth";

interface LoginResponse {
  token: string;
}

interface ProfileResponse {
  user: AuthUser;
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
};
