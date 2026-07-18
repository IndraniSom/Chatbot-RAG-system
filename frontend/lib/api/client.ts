/**
 * ApiError — typed error thrown by every API helper when the backend returns
 * `{ success: false, message | error }`. Carries the HTTP status so the UI
 * can branch on 401/403/404/409/500 if it needs to.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly endpoint: string;
  readonly serverMessage?: string;

  constructor(opts: {
    message: string;
    status: number;
    endpoint: string;
    serverMessage?: string;
  }) {
    super(opts.message);
    this.name = "ApiError";
    this.status = opts.status;
    this.endpoint = opts.endpoint;
    this.serverMessage = opts.serverMessage;
  }
}

/**
 * Unwrap a backend `{ success, data, message, error }` envelope.
 *
 *  - `{ success: true, data }`  → returns `data`
 *  - anything else              → throws ApiError with the right status
 *
 * The backend occasionally uses `message` or `error` for the failure reason,
 * so we accept either.
 */
export function unwrap<T>(
  payload:
    | { success: true; data: T; message?: string }
    | { success: false; message?: string; error?: string },
  status: number,
  endpoint: string
): T {
  if (payload && (payload as { success: boolean }).success === true) {
    return (payload as { data: T }).data;
  }
  const failure = payload as { message?: string; error?: string };
  const msg = failure?.message || failure?.error || "Request failed";
  throw new ApiError({
    message: msg,
    status,
    endpoint,
    serverMessage: msg,
  });
}