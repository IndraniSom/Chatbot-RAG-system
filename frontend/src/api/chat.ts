import { request } from "./http";
import type {
  ChatRequestPayload,
  ChatResponseData,
  HealthResponseData,
} from "./types";

/**
 * Typed wrappers around the backend's /api/* routes. The ChatWindow consumes
 * `sendMessage`; the rest are exported for health checks / debugging.
 */
export const chatApi = {
  /** POST /api/chat  →  { reply: string } */
  sendMessage(payload: ChatRequestPayload, signal?: AbortSignal) {
    return request<ChatResponseData>({
      path: "/chat",
      method: "POST",
      body: payload,
      signal,
    });
  },

  /** GET /api/health  →  { message, uptime } */
  health(signal?: AbortSignal) {
    return request<HealthResponseData>({
      path: "/health",
      method: "GET",
      signal,
    });
  },
};
