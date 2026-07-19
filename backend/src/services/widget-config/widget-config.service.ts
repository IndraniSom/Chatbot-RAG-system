import Website, {
  DEFAULT_APPEARANCE,
  type IWebsiteAppearance,
} from "../../models/website";

/**
 * Public payload returned by `GET /api/widget-config/:websiteId`.
 *
 * Intentionally minimal — a chat widget on a customer's site needs the
 * public website id + branding colors + logo URL, nothing else. We
 * don't disclose who owns the chatbot or whether admin approval is in
 * place (those flags are inferrable from "you got 404 vs valid config"
 * but the spec is to expose them via the dashboard, not the widget).
 */
export interface PublicWidgetConfig {
  websiteId: string;
  primaryColor: string;
  surfaceColor: string;
  logoUrl?: string;
}

/**
 * Thrown when the public widget config endpoint can't find a usable
 * website. Maps to 404 so widget hosts can fall back to default
 * styling.
 */
class WidgetConfigNotFoundError extends Error {
  constructor() {
    super("Widget configuration not found");
    this.name = "WidgetConfigNotFoundError";
  }
}

class WidgetConfigService {
  /**
   * Resolve the minimum branding payload for an approved, active
   * website. Used by `GET /api/widget-config/:websiteId`.
   *
   * We deliberately only return `primaryColor`, `surfaceColor`, and
   * `logoUrl` — the widget doesn't need the rest of the appearance
   * subdoc (e.g. `logoPublicId` is server-internal).
   */
  async getPublicConfig(
    websiteId: string
  ): Promise<PublicWidgetConfig> {
    if (!websiteId || typeof websiteId !== "string") {
      throw new WidgetConfigNotFoundError();
    }

    const trimmed = websiteId.trim();
    if (!trimmed) {
      throw new WidgetConfigNotFoundError();
    }

    const website = await Website.findOne({
      websiteId: trimmed,
      status: "APPROVED",
      isActive: true,
    }).select("websiteId appearance");

    if (!website) {
      throw new WidgetConfigNotFoundError();
    }

    const appearance: IWebsiteAppearance =
      website.appearance ?? {
        primaryColor:
          DEFAULT_APPEARANCE.primaryColor,
        surfaceColor:
          DEFAULT_APPEARANCE.surfaceColor,
      };

    return {
      websiteId: website.websiteId,
      primaryColor:
        appearance.primaryColor ??
        DEFAULT_APPEARANCE.primaryColor,
      surfaceColor:
        appearance.surfaceColor ??
        DEFAULT_APPEARANCE.surfaceColor,
      logoUrl: appearance.logoUrl,
    };
  }
}

export default new WidgetConfigService();
