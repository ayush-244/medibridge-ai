import type { UserRole } from "@/lib/constants";

export interface AuthUser {
  id: string;
  role: UserRole;
  hospital?: string | null;
  name?: string;
  email?: string;
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
