import type { UserRole } from "@/lib/constants";

export interface NotificationPreferences {
  referralAccepted: boolean;
  doctorAssigned: boolean;
  bedReserved: boolean;
  reservationExpired: boolean;
}

export interface AuthUser {
  id: string;
  role: UserRole;
  hospital?: string | null;
  hospitalName?: string;
  name?: string;
  email?: string;
  phone?: string;
  notificationPreferences?: NotificationPreferences;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface StoredAuth {
  token: string;
  user: AuthUser;
}

export interface UpdateProfilePayload {
  name?: string;
  phone?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}
