import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { API_BASE_URL, AUTH_STORAGE_KEY } from "@/lib/constants";
import { ROUTES } from "@/lib/routes";
import type { StoredAuth } from "@/types/auth";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);

    if (stored) {
      try {
        const { token } = JSON.parse(stored) as StoredAuth;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    const status = error.response?.status;
    const message =
      error.response?.data?.message ||
      error.message ||
      "An unexpected error occurred";

    if (status === 401) {
      localStorage.removeItem(AUTH_STORAGE_KEY);

      if (window.location.pathname !== ROUTES.LOGIN) {
        window.location.href = ROUTES.LOGIN;
      }
    }

    return Promise.reject({
      status,
      message,
      pendingApproval: Boolean(
        (error.response?.data as { pendingApproval?: boolean })?.pendingApproval,
      ),
      verificationStatus: (
        error.response?.data as { verificationStatus?: string }
      )?.verificationStatus,
      original: error,
    });
  },
);

export default api;
