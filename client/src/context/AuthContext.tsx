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
  mustChangePassword: boolean;
  login: (credentials: LoginCredentials) => Promise<{
    user: AuthUser;
    mustChangePassword: boolean;
  }>;
  logout: () => void;
  refreshProfile: () => Promise<AuthUser | null>;
  clearMustChangePassword: () => void;
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

  const mustChangePassword = Boolean(user?.mustChangePassword);

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

  const clearMustChangePassword = useCallback(() => {
    setUser((current) => {
      if (!current) return current;
      const updated = { ...current, mustChangePassword: false };
      if (token) {
        persistAuth(token, updated);
      }
      return updated;
    });
  }, [token]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const result = await authService.login(credentials);

    setToken(result.token);

    let profile = result.user;
    if (!profile?.id) {
      localStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({ token: result.token }),
      );
      profile = await authService.getProfile();
    }

    const mergedProfile: AuthUser = {
      ...profile,
      mustChangePassword: result.mustChangePassword,
    };

    persistAuth(result.token, mergedProfile);
    setUser(mergedProfile);

    return {
      user: mergedProfile,
      mustChangePassword: result.mustChangePassword,
    };
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
      mustChangePassword,
      login,
      logout,
      refreshProfile,
      clearMustChangePassword,
    }),
    [
      user,
      token,
      isLoading,
      mustChangePassword,
      login,
      logout,
      refreshProfile,
      clearMustChangePassword,
    ],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}
