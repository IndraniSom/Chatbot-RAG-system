/**
 * Safe parsing helpers for the public widget configuration envelope.
 *
 * The widget embed (loaded from a customer's site) calls
 * `GET /api/widget-config/:websiteId` and expects a JSON body shaped like:
 *
 *   {
 *     "success": true,
 *     "data": {
 *       "widgetConfig": {
 *         "websiteId":     "ws_51322baf429e0ff0",
 *         "primaryColor":  "#2563eb",
 *         "surfaceColor":  "#ffffff",
 *         "logoUrl":       "https://..."   // optional
 *       }
 *     }
 *   }
 *
 * The server is the source of truth for that shape (see
 * `services/widget-config/widget-config.service.ts` and
 * `controllers/widget-config.controller.ts`). This module exists so the
 * widget bundle can tolerate any of:
 *
 *   - the canonical envelope, exactly as documented,
 *   - a backend accidentally returning a flatter
 *     `{ success, data: { websiteId, primaryColor, ... } }`,
 *   - a stripped-down `{}` (e.g. CDN/proxy stripped fields),
 *   - a 404 with `{ success: false, message }` body,
 *   - a transport error / non-JSON body.
 *
 * In every case the parser returns a fully-populated `PublicWidgetConfig`
 * with safe defaults, so a widget that mounts without config still
 * renders — it just falls back to brand defaults.
 */
import {
  DEFAULT_APPEARANCE,
  type IWebsiteAppearance,
} from "../../models/website";

/** Public re-export: the canonical public type the widget consumes. */
export interface PublicWidgetConfig {
  websiteId: string;
  primaryColor: string;
  surfaceColor: string;
  logoUrl?: string;
}

/** Tunable defaults — mirror `models/website.ts` `DEFAULT_APPEARANCE`. */
const FALLBACK_PRIMARY = DEFAULT_APPEARANCE.primaryColor;
const FALLBACK_SURFACE = DEFAULT_APPEARANCE.surfaceColor;

/**
 * The subset of the API envelope the widget actually cares about.
 *
 * We intentionally type this loosely (each field optional) so the
 * parser can be lenient about which fields made it through.
 */
interface RawEnvelope {
  success?: unknown;
  data?: {
    widgetConfig?: Partial<PublicWidgetConfig>;
    // Mirrors the fallback shape in case the server returns a flatter
    // payload (defensive — current server never does).
    websiteId?: unknown;
    primaryColor?: unknown;
    surfaceColor?: unknown;
    logoUrl?: unknown;
  };
}

/**
 * Returned from `parsePublicWidgetConfigBody`. The widget should treat
 * `envelopeKind` as a soft hint — it never gates rendering, only
 * diagnostics.
 */
export interface ParsedWidgetConfig {
  /** Always present; either extracted or synthesized from input. */
  config: PublicWidgetConfig;
  /** Where the parser located the colors so log lines stay meaningful. */
  envelopeKind:
    | "nested-data-widgetConfig"
    | "nested-data-flat"
    | "flat-root"
    | "fallback";
}

/**
 * Normalize one color input. Accepts: `#abc`, `#aabbcc`, `#aabbccdd`
 * (alpha dropped). Anything else collapses to `undefined` so we can
 * substitute the default.
 */
function normalizeHex(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(trimmed)) {
    return undefined;
  }
  let hex = trimmed.slice(1);
  if (hex.length === 3) {
    hex = hex.split("").map((ch) => ch + ch).join("");
  } else if (hex.length === 8) {
    hex = hex.slice(0, 6);
  }
  return `#${hex.toLowerCase()}`;
}

/**
 * Validate that a string looks like the public website id Scrappy
 * embeds in the install snippet. We don't *assume* the format in the
 * model layer, but the widget side benefits from a sanity check so a
 * hostile server response can't poison the local key.
 */
function normalizeWebsiteId(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  // Be permissive on the prefix; only require a non-empty id token.
  return trimmed;
}

/**
 * Coerce a logo URL. Empty strings and obviously non-URL values are
 * dropped so the widget can `if (config.logoUrl)` without surprises.
 */
function normalizeLogoUrl(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  // Reject anything that isn't http(s) — the widget would log a
  // network error and a malicious response shouldn't be able to point
  // customers at e.g. `javascript:`.
  if (!/^https?:\/\//i.test(trimmed)) return undefined;
  return trimmed;
}

/**
 * Parse the body returned by `GET /api/widget-config/:websiteId` into
 * a fully-populated `PublicWidgetConfig`. Never throws.
 *
 * Strategy: peel off envelope layers in order of decreasing specificity,
 * tracking which path produced the result. The widget can use
 * `envelopeKind` for diagnostics; the host page can override the
 * parser's defaults via attributes (see the widget integration).
 */
export function parsePublicWidgetConfigBody(
  raw: unknown
): ParsedWidgetConfig {
  const fallback: PublicWidgetConfig = {
    websiteId: "",
    primaryColor: FALLBACK_PRIMARY,
    surfaceColor: FALLBACK_SURFACE,
  };

  if (raw == null || typeof raw !== "object") {
    return { config: fallback, envelopeKind: "fallback" };
  }

  const env = raw as RawEnvelope;

  const data = env.data;
  if (data && typeof data === "object") {
    // 1) Canonical nested envelope: data.widgetConfig.{...}
    const nested = data.widgetConfig;
    if (nested && typeof nested === "object") {
      const primary = normalizeHex(nested.primaryColor);
      const surface = normalizeHex(nested.surfaceColor);
      const id = normalizeWebsiteId(nested.websiteId);
      const logo = normalizeLogoUrl(nested.logoUrl);
      if (primary || surface || id || logo) {
        return {
          config: {
            websiteId: id ?? "",
            primaryColor: primary ?? FALLBACK_PRIMARY,
            surfaceColor: surface ?? FALLBACK_SURFACE,
            logoUrl: logo,
          },
          envelopeKind: "nested-data-widgetConfig",
        };
      }
    }

    // 2) Flat nested: data.{ websiteId, primaryColor, ... }
    const flatPrimary = normalizeHex(data.primaryColor);
    const flatSurface = normalizeHex(data.surfaceColor);
    const flatId = normalizeWebsiteId(data.websiteId);
    const flatLogo = normalizeLogoUrl(data.logoUrl);
    if (flatPrimary || flatSurface || flatId || flatLogo) {
      return {
        config: {
          websiteId: flatId ?? "",
          primaryColor: flatPrimary ?? FALLBACK_PRIMARY,
          surfaceColor: flatSurface ?? FALLBACK_SURFACE,
          logoUrl: flatLogo,
        },
        envelopeKind: "nested-data-flat",
      };
    }
  }

  // 3) Flat root (defensive): { websiteId, primaryColor, ... }
  const rootPrimary = normalizeHex((raw as any).primaryColor);
  const rootSurface = normalizeHex((raw as any).surfaceColor);
  const rootId = normalizeWebsiteId((raw as any).websiteId);
  const rootLogo = normalizeLogoUrl((raw as any).logoUrl);
  if (rootPrimary || rootSurface || rootId || rootLogo) {
    return {
      config: {
        websiteId: rootId ?? "",
        primaryColor: rootPrimary ?? FALLBACK_PRIMARY,
        surfaceColor: rootSurface ?? FALLBACK_SURFACE,
        logoUrl: rootLogo,
      },
      envelopeKind: "flat-root",
    };
  }

  return { config: fallback, envelopeKind: "fallback" };
}

/**
 * Helper: synthesize a config from per-attribute host overrides. The
 * widget embed reads e.g. `data-primary-color`, `data-surface-color`,
 * `data-logo-url` and merges them on top of (or in lieu of) the API
 * payload. Useful for marketing pages / preview embeds.
 */
export function mergeWidgetConfig(
  api: PublicWidgetConfig,
  overrides: Partial<PublicWidgetConfig>
): PublicWidgetConfig {
  const primary =
    normalizeHex(overrides.primaryColor) ?? api.primaryColor;
  const surface =
    normalizeHex(overrides.surfaceColor) ?? api.surfaceColor;
  const id = normalizeWebsiteId(overrides.websiteId) ?? api.websiteId;
  const logo =
    overrides.logoUrl === undefined
      ? api.logoUrl
      : normalizeLogoUrl(overrides.logoUrl);
  return {
    websiteId: id,
    primaryColor: primary,
    surfaceColor: surface,
    logoUrl: logo,
  };
}

// Re-export so downstream callers don't need a separate import for the
// appearance type.
export type { IWebsiteAppearance };
