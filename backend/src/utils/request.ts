/**
 * Narrow a single path parameter to a plain string.
 *
 * Express 5 types `req.params` values as `string | string[] | undefined`.
 * We pick the first segment and verify it's a plain non-empty string before
 * passing it to validators like `isValidObjectId`.
 */
export function coerceIdParam(
  raw: string | string[] | undefined
): string | null {
  if (typeof raw === "string" && raw.length > 0) return raw;
  if (Array.isArray(raw)) {
    const first = raw[0];
    if (typeof first === "string" && first.length > 0) return first;
  }
  return null;
}

/**
 * Recognize "Website not found" errors thrown by the service layer.
 * Centralizing this keeps controllers from doing string-equality inline.
 */
export function isNotFoundError(error: unknown): boolean {
  return (
    error instanceof Error && error.message === "Website not found"
  );
}

/**
 * Recognize "Website is already <status>" errors thrown when an admin tries
 * to approve / reject a website that's no longer PENDING.
 */
export function isConflictError(error: unknown): boolean {
  return (
    error instanceof Error &&
    /^Website is already (approved|rejected|pending)/.test(error.message)
  );
}
