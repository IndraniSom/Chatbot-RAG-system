import {
  Router,
} from "express";

import websiteController from "../controllers/website.controller";

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

export default router;