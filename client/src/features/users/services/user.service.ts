import api from "@/services/api";
import type { ApiResponse } from "@/types/api";
import type {
  CreateUserPayload,
  User,
  UserDetail,
} from "@/features/users/types/user.types";

export const userService = {
  async getAll(): Promise<User[]> {
    const { data } = await api.get<ApiResponse<User[]>>("/users");

    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to fetch users");
    }

    return data.data;
  },

  async getById(id: string): Promise<UserDetail> {
    const { data } = await api.get<ApiResponse<UserDetail>>(`/users/${id}`);

    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to fetch user details");
    }

    return data.data;
  },

  async create(payload: CreateUserPayload): Promise<User> {
    const { data } = await api.post<ApiResponse<User>>(
      "/auth/register",
      payload,
    );

    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to create user");
    }

    return data.data;
  },

  async deactivate(id: string): Promise<User> {
    const { data } = await api.patch<ApiResponse<User>>(
      `/users/${id}/deactivate`,
    );

    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to deactivate user");
    }

    return data.data;
  },
};
