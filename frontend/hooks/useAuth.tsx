"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { ApiError, login, me, register, clearToken, setToken } from "@/lib/api";
import type { User } from "@/types";

interface AuthContextValue {
  user: User | null;
  status: "loading" | "authenticated" | "unauthenticated";
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthContextValue["status"]>("loading");

  const refresh = useCallback(async () => {
    // No token → not logged in, skip the call.
    if (typeof window !== "undefined" && !window.localStorage.getItem("scrappy.token")) {
      setUser(null);
      setStatus("unauthenticated");
      return;
    }
    try {
      const { user } = await me();
      setUser(user);
      setStatus("authenticated");
    } catch (err) {
      // 401 from the interceptor already cleared the token.
      if (err instanceof ApiError && err.status === 401) {
        setUser(null);
        setStatus("unauthenticated");
        return;
      }
      // Other errors (network) — keep whatever state we had.
      setUser(null);
      setStatus("unauthenticated");
    }
  }, []);

  // On mount, validate any existing token.
  useEffect(() => {
    void refresh();
  }, [refresh]);

  const doLogin = useCallback(
    async (email: string, password: string) => {
      const { token, user } = await login({ email, password });
      setToken(token);
      setUser(user);
      setStatus("authenticated");
    },
    []
  );

  const doRegister = useCallback(
    async (name: string, email: string, password: string) => {
      const { token, user } = await register({ name, email, password });
      setToken(token);
      setUser(user);
      setStatus("authenticated");
    },
    []
  );

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    setStatus("unauthenticated");
    router.replace("/login");
  }, [router]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      login: doLogin,
      register: doRegister,
      logout,
      refresh,
    }),
    [user, status, doLogin, doRegister, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}