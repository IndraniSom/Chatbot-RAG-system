import {
  Router,
} from "express";

import websiteController from "../controllers/website.controller";
import appearanceController from "../controllers/appearance.controller";

import {
  authenticateUser,
} from "../middleware/auth.middleware";

const router =
  Router();

/**
 * Every route below this middleware
 * requires a valid JWT.
 */
router.use(
  authenticateUser
);

/**
 * POST /api/websites
 *
 * Submit new website.
 */
router.post(
  "/",
  (req, res) =>
    websiteController
      .createWebsite(
        req,
        res
      )
);

/**
 * GET /api/websites
 *
 * Get logged-in user's websites.
 */
router.get(
  "/",
  (req, res) =>
    websiteController
      .getMyWebsites(
        req,
        res
      )
);

/**
 * GET /api/websites/:id
 *
 * Get one owned website.
 */
router.get(
  "/:id",
  (req, res) =>
    websiteController
      .getWebsite(
        req,
        res
      )
);

/**
 * DELETE /api/websites/:id
 */
router.delete(
  "/:id",
  (req, res) =>
    websiteController
      .deleteWebsite(
        req,
        res
      )
);
/**
 * GET
 * /api/websites/:id/installation
 *
 * Get installation script.
 */
router.get(
  "/:id/installation",
  (req, res) =>
    websiteController
      .getInstallation(
        req,
        res
      )
);

/**
 * POST
 * /api/websites/:id/verify-installation
 *
 * Verify widget installation.
 */
router.post(
  "/:id/verify-installation",
  (req, res) =>
    websiteController
      .verifyInstallation(
        req,
        res
      )
);
router.post(
  "/:id/index",
  authenticateUser,
  websiteController.indexWebsite
);
router.get(

"/:id/index-status",

authenticateUser,

websiteController.getIndexStatus

);
router.delete(
  "/:id/index-job",
  authenticateUser,
  websiteController.cancelIndexJob
);

/**
 * PATCH /api/websites/:id/appearance
 *
 * Update the widget's brand colors and optionally clear its logo.
 */
router.patch(
  "/:id/appearance",
  (req, res) =>
    appearanceController
      .updateAppearance(
        req,
        res
      )
);

/**
 * POST /api/websites/:id/logo/signature
 *
 * Mints a short-lived, scoped signature for browser-direct uploads
 * to Cloudinary.
 */
router.post(
  "/:id/logo/signature",
  (req, res) =>
    appearanceController
      .createLogoSignature(
        req,
        res
      )
);

/**
 * POST /api/websites/:id/logo/complete
 *
 * Body: `{ publicId, timestamp, signature }`. Verifies and persists a
 * freshly uploaded logo.
 */
router.post(
  "/:id/logo/complete",
  (req, res) =>
    appearanceController
      .completeLogoUpload(
        req,
        res
      )
);

/**
 * DELETE /api/websites/:id/logo
 *
 * Remove the widget logo.
 */
router.delete(
  "/:id/logo",
  (req, res) =>
    appearanceController
      .removeLogo(
        req,
        res
      )
);

export default router;
