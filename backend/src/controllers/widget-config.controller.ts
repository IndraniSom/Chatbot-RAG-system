import { Response } from "express";

import widgetConfigService from "../services/widget-config/widget-config.service";

import { coerceIdParam } from "../utils/request";

/**
 * HTTP boundary for the public widget configuration endpoint.
 *
 * The widget embed (loaded from customer sites) calls
 * `GET /api/widget-config/:websiteId` to fetch its brand colors and
 * logo URL. No auth is required: this is the data the widget needs to
 * render correctly, and it's safe to expose (we only ever return color
 * hex values and the public logo URL).
 *
 * Status-code mapping:
 *  - 200  configuration returned
 *  - 404  websiteId is unknown / not approved / not active
 */
class WidgetConfigController {
  /**
   * GET /api/widget-config/:websiteId
   *
   * `websiteId` here is the public ID baked into the widget snippet
   * (e.g. `ws_4f28b13a9d52`), NOT the Mongo `_id`.
   */
  async getWidgetConfig(req: any, res: Response) {
    try {
      const websiteId = coerceIdParam(req.params.websiteId);

      if (!websiteId) {
        return res.status(404).json({
          success: false,
          message: "Widget configuration not found",
        });
      }

      const config =
        await widgetConfigService.getPublicConfig(
          websiteId
        );

      return res.status(200).json({
        success: true,
        data: { widgetConfig: config },
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "Widget configuration not found"
      ) {
        return res.status(404).json({
          success: false,
          message: "Widget configuration not found",
        });
      }

      return res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch widget configuration",
      });
    }
  }
}

export default new WidgetConfigController();
