import {
  Router,
} from "express";

import adminController from "../controllers/admin.controller";

import {
  authenticateUser,
} from "../middleware/auth.middleware";

import {
  requireAdmin,
} from "../middleware/admin.middleware";

const router =
  Router();

/**
 * Everything under /api/admin
 * requires:
 *
 * 1. Valid JWT
 * 2. ADMIN role
 */
router.use(
  authenticateUser
);

router.use(
  requireAdmin
);

/**
 * GET
 * /api/admin/websites/pending
 *
 * IMPORTANT:
 * Keep this before /websites/:id
 * if you add a dynamic route later.
 */
router.get(
  "/websites/pending",
  (req, res) =>
    adminController
      .getPendingWebsites(
        req,
        res
      )
);

/**
 * GET
 * /api/admin/websites
 */
router.get(
  "/websites",
  (req, res) =>
    adminController
      .getAllWebsites(
        req,
        res
      )
);

/**
 * PATCH
 * /api/admin/websites/:id/approve
 */
router.patch(
  "/websites/:id/approve",
  (req, res) =>
    adminController
      .approveWebsite(
        req,
        res
      )
);

/**
 * PATCH
 * /api/admin/websites/:id/reject
 */
router.patch(
  "/websites/:id/reject",
  (req, res) =>
    adminController
      .rejectWebsite(
        req,
        res
      )
);

/**
 * GET
 * /api/admin/users
 */
router.get(
  "/users",
  (req, res) =>
    adminController
      .getAllUsers(
        req,
        res
      )
);

export default router;