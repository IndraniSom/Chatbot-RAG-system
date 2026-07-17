import { ApiError } from "./errors";
import type { ApiResponse } from "./types";

/**
 * Base URL is taken from Vite's `VITE_API_URL`. When undefined (or in dev with
 * a Vite proxy configured), the request is sent as a same-origin path.
 * Example: VITE_API_URL="http://localhost:5000/api"
 */
const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? "/api";

/** Default timeout for any single API call. */
const DEFAULT_TIMEOUT_MS = 20_000;

interface RequestOptions {
  /** Path appended to BASE_URL — e.g. "/chat" or "/health" */
  path: string;
  /** HTTP method, defaults to GET. */
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  /** JSON body — automatically stringified. */
  body?: unknown;
  /** Optional signal for in-flight cancellation. */
  signal?: AbortSignal;
  /** Timeout in ms. Defaults to 20s. */
  timeoutMs?: number;
}

function joinUrl(base: string, path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const b = base.endsWith("/") ? base.slice(0, -1) : base;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${b}${p}`;
}

/**
 * Tiny typed fetch wrapper. Throws `ApiError` on network failure, non-2xx
 * HTTP status, or a backend `{ success: false }` envelope.
 */
export async function request<T>({
  path,
  method = "GET",
  body,
  signal,
  timeoutMs = DEFAULT_TIMEOUT_MS,
}: RequestOptions): Promise<T> {
  const url = joinUrl(BASE_URL, path);

  // Compose an AbortController that fires on either caller signal or timeout.
  const controller = new AbortController();
  const onCallerAbort = () => controller.abort(signal?.reason);
  if (signal) {
    if (signal.aborted) controller.abort(signal.reason);
    else signal.addEventListener("abort", onCallerAbort, { once: true });
  }
  const timeoutId = window.setTimeout(
    () => controller.abort(new DOMException("Timeout", "TimeoutError")),
    timeoutMs
  );

  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
      credentials: "omit",
    });
  } catch (err) {
    if (signal) signal.removeEventListener("abort", onCallerAbort);
    window.clearTimeout(timeoutId);
    if ((err as { name?: string }).name === "AbortError" && !signal?.aborted) {
      throw new ApiError({
        message: "Request timed out. Please try again.",
        status: 0,
        endpoint: url,
      });
    }
    throw new ApiError({
      message: "Network error. Is the backend running?",
      status: 0,
      endpoint: url,
    });
  } finally {
    window.clearTimeout(timeoutId);
    if (signal) signal.removeEventListener("abort", onCallerAbort);
  }

  // Try to parse JSON; some error responses may be empty.
  let parsed: ApiResponse<T> | null = null;
  const text = await res.text();
  if (text) {
    try {
      parsed = JSON.parse(text) as ApiResponse<T>;
    } catch {
      // Non-JSON body — fall through to status-based error.
    }
  }

  if (!res.ok) {
    const serverMessage =
      (parsed && parsed.success === false && parsed.error) ||
      `Request failed (${res.status})`;
    throw new ApiError({
      message: serverMessage,
      status: res.status,
      endpoint: url,
      serverMessage,
    });
  }

  if (parsed && parsed.success === false) {
    throw new ApiError({
      message: parsed.error,
      status: res.status,
      endpoint: url,
      serverMessage: parsed.error,
    });
  }

  if (parsed && parsed.success === true) {
    return parsed.data;
  }

  // Unexpected body shape — return as-is so dev can see the problem.
  return parsed as unknown as T;
}
