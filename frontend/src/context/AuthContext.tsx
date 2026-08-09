import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { fetchProfile, getAuthToken, setAuthToken } from "../services/authApi";
import type { AuthResponse, AuthUser } from "../types/auth";

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (payload: AuthResponse) => void;
  logout: () => void;
  restoreSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const login = useCallback((payload: AuthResponse) => {
    setAuthToken(payload.token);
    setUser(payload.user);
    try {
      const ap = (payload.user as any).appearance;
      if (ap === "light" || ap === "dark") {
        document.documentElement.setAttribute("data-theme", ap);
        window.localStorage.setItem("catalog-appearance", ap);
      } else {
        document.documentElement.removeAttribute("data-theme");
        window.localStorage.removeItem("catalog-appearance");
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const logout = useCallback(() => {
    setAuthToken(null);
    setUser(null);
    try {
      document.documentElement.removeAttribute("data-theme");
      window.localStorage.removeItem("catalog-appearance");
    } catch (e) {
      // ignore
    }
  }, []);

  const restoreSession = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const data = await fetchProfile();
      setUser(data.user);
      try {
        const ap = (data.user as any).appearance;
        if (ap === "light" || ap === "dark") {
          document.documentElement.setAttribute("data-theme", ap);
          window.localStorage.setItem("catalog-appearance", ap);
        } else {
          document.documentElement.removeAttribute("data-theme");
          window.localStorage.removeItem("catalog-appearance");
        }
      } catch (e) {
        // ignore
      }
    } catch {
      setAuthToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void restoreSession();
  }, [restoreSession]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      loading,
      login,
      logout,
      restoreSession,
    }),
    [user, loading, login, logout, restoreSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }

  return context;
}
