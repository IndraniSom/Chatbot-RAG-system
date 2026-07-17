/**
 * Mirrors the backend response envelope used by /api/* routes.
 * Backend shape: { success: true, data: T } | { success: false, error: string }
 */
export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

/** Payload sent to POST /api/chat */
export interface ChatRequestPayload {
  message: string;
}

/** Payload returned by POST /api/chat → data field */
export interface ChatResponseData {
  reply: string;
}

/** Payload returned by GET /api/health → data field */
export interface HealthResponseData {
  message: string;
  uptime: number;
}
