/**
 * Strict appearance validators.
 *
 * These run on every PATCH call before we touch the database. The brand
 * panel has very few inputs so we keep validation inline (no schema
 * library) — but the helpers all live here so both the color PATCH and
 * the completion flow share the same rules.
 */

/**
 * Allowed logo MIME types. `png`, `jpg`, `jpeg`, `webp` per the spec.
 *
 * Cloudinary reports format using a short token (no MIME prefix). The
 * completion endpoint normalizes Cloudinary's `format` field before
 * passing it here.
 */
export const ALLOWED_LOGO_FORMATS = new Set<string>([
  "png",
  "jpg",
  "jpeg",
  "webp",
]);

/**
 * Max logo size in bytes: 2 MB. Anything larger is suspicious for a
 * chat header logo and would slow the widget.
 */
export const MAX_LOGO_BYTES = 2 * 1024 * 1024;

/**
 * Sanity bounds on logo dimensions. We don't want a 10000px-wide image
 * to ship to every visitor's browser.
 */
export const MAX_LOGO_DIMENSION = 1024;
export const MIN_LOGO_DIMENSION = 8;

/**
 * The exact set of fields an owner is allowed to PATCH on
 * `/api/websites/:id/appearance`. Anything else causes the controller
 * to short-circuit with a 400 rather than silently dropping the input.
 */
export const ALLOWED_APPEARANCE_FIELDS = new Set<string>([
  "primaryColor",
  "surfaceColor",
  "removeLogo",
]);

/** Accept the dashboard's normalized six-digit `#RRGGBB` form only. */
const HEX_RE = /^#[0-9a-fA-F]{6}$/;

export function isValidHexColor(value: unknown): value is string {
  return (
    typeof value === "string" &&
    HEX_RE.test(value.trim())
  );
}

/** Normalize a validated color to uppercase `#RRGGBB`. */
export function normalizeHexColor(value: string): string {
  const trimmed = value.trim();
  if (!HEX_RE.test(trimmed)) {
    throw new Error(
      "Color must be a six-digit hex string like #2563EB"
    );
  }

  return trimmed.toUpperCase();
}
