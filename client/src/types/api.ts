export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
  token?: string;
  user?: unknown;
  mustChangePassword?: boolean;
  temporaryPassword?: string;
  pendingApproval?: boolean;
  verificationStatus?: string;
}

export interface ApiError {
  success: false;
  message: string;
}
