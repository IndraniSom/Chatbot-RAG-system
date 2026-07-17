/**
 * Strongly-typed error thrown by the http client when an API call fails.
 * Carries HTTP status and the backend `error` string (when available) so the
 * UI can render meaningful messages.
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
