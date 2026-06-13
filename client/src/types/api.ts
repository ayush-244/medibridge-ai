export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
  token?: string;
  user?: unknown;
}

export interface ApiError {
  success: false;
  message: string;
}
