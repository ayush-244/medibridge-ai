import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { AUTH_STORAGE_KEY } from "@/lib/constants";
import { ROUTES } from "@/lib/routes";
import { authService } from "@/services/auth.service";
import type { AuthUser, LoginCredentials, StoredAuth } from "@/types/auth";

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthUser>;
  logout: () => void;
  refreshProfile: () => Promise<AuthUser | null>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

function loadStoredAuth(): StoredAuth | null {
  const stored = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!stored) return null;

  try {
    return JSON.parse(stored) as StoredAuth;
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

function persistAuth(token: string, user: AuthUser) {
  const payload: StoredAuth = { token, user };
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setUser(null);
    setToken(null);
    window.location.href = ROUTES.LOGIN;
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!token) return null;

    const profile = await authService.getProfile();
    persistAuth(token, profile);
    setUser(profile);
    return profile;
  }, [token]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const newToken = await authService.login(credentials);
  
    setToken(newToken);
  
    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({ token: newToken })
    );
  
    const profile = await authService.getProfile();
  
    persistAuth(newToken, profile);
    setUser(profile);
    return profile;
  }, []);

  useEffect(() => {
    const init = async () => {
      const stored = loadStoredAuth();
      if (!stored?.token) {
        setIsLoading(false);
        return;
      }

      setToken(stored.token);
      setUser(stored.user);

      try {
        const profile = await authService.getProfile();
        persistAuth(stored.token, profile);
        setUser(profile);
      } catch {
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, [logout]);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      isLoading,
      login,
      logout,
      refreshProfile,
    }),
    [user, token, isLoading, login, logout, refreshProfile],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}
