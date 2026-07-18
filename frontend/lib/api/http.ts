import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import { ApiError, unwrap } from "./client";

/**
 * Read the JWT token from localStorage. The token is set by the auth API
 * after login/register and cleared on logout.
 */
export const TOKEN_KEY = "scrappy.token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
}

/**
 * Configured Axios instance.
 *
 *  - baseURL is `NEXT_PUBLIC_API_URL` (defaults to "/api" so the Next dev
 *    proxy forwards /api/* to the Express backend during dev).
 *  - Attaches the JWT as `Authorization: Bearer <token>` on every request.
 *  - Throws a typed `ApiError` so callers don't need to touch axios types.
 */
export const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 30_000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * `apiRequest<T>` is the helper every endpoint module uses.
 *
 *  - On success, returns `data` from the `{ success, data }` envelope.
 *  - On failure, throws a typed `ApiError`.
 *  - On 401, clears the stored token so the user lands on /login next time
 *    they visit a protected page (the auth context redirects them).
 */
export async function apiRequest<T>(
  config: AxiosRequestConfig
): Promise<T> {
  try {
    const res = await api.request(config);
    return unwrap<T>(res.data, res.status, config.url ?? "");
  } catch (err) {
    const axErr = err as AxiosError<{
      success?: false;
      message?: string;
      error?: string;
    }>;

    if (axErr.response) {
      const body = axErr.response.data;
      const message = body?.message || body?.error || axErr.message;

      // Token rejected — clear it so the next render of a protected page
      // will redirect to /login.
      if (axErr.response.status === 401) {
        clearToken();
        if (
          typeof window !== "undefined" &&
          !window.location.pathname.startsWith("/login") &&
          !window.location.pathname.startsWith("/signup")
        ) {
          // Use replace so the user can't go "back" to a broken state.
          window.location.replace(
            `/login?next=${encodeURIComponent(window.location.pathname)}`
          );
        }
      }

      throw new ApiError({
        message: message ?? "Request failed",
        status: axErr.response.status,
        endpoint: config.url ?? "",
        serverMessage: message,
      });
    }

    // No HTTP response — network error / timeout.
    throw new ApiError({
      message:
        axErr.code === "ECONNABORTED"
          ? "Request timed out. Please try again."
          : "Network error. Please check your connection.",
      status: 0,
      endpoint: config.url ?? "",
    });
  }
}