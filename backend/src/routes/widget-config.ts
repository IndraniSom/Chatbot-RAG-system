/**
 * Public widget configuration endpoint.
 *
 * Mounted at `/api/widget-config/:websiteId` outside the auth middleware
 * because the widget itself (loaded from a customer's site) is the
 * caller and has no Scrappy JWT. The data returned is intentionally
 * minimal: brand colors + logo URL, nothing identifying.
 */
import { Router } from "express";

import widgetConfigController from "../controllers/widget-config.controller";

const router = Router();

/**
 * GET /api/widget-config/:websiteId
 *
 * `websiteId` is the *public* widget id (e.g. `ws_4f28b13a9d52`),
 * NOT the Mongo ObjectId.
 */
router.get(
  "/:websiteId",
  (req, res) =>
    widgetConfigController.getWidgetConfig(req, res)
);

export default router;
