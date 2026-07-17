import {
  Response,
} from "express";

import {
  isValidObjectId,
} from "mongoose";

import adminService from "../services/admin/admin.service";

import {
  AuthenticatedRequest,
} from "../middleware/auth.middleware";

import {
  coerceIdParam,
  isConflictError,
  isNotFoundError,
} from "../utils/request";

/**
 * HTTP boundary for /api/admin/*.
 *
 * `requireAdmin` middleware is expected upstream — it returns 403 if the
 * caller is not an admin. These handlers still defensively check
 * `req.user?.userId` so a missed middleware mount doesn't accidentally
 * expose admin data.
 *
 * Status-code mapping:
 *  - 401  missing auth (defensive guard)
 *  - 400  malformed input
 *  - 404  website not found
 *  - 409  website is no longer PENDING (already approved/rejected)
 *  - 500  unexpected server error
 */
class AdminController {
  /**
   * GET /api/admin/websites
   *
   * Get all websites across all customers.
   */
  async getAllWebsites(
    req: AuthenticatedRequest,
    res: Response
  ) {
    try {
      const adminId = req.user?.userId;
      if (!adminId) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      const websites = await adminService.getAllWebsites();

      return res.status(200).json({
        success: true,
        data: {
          count: websites.length,
          websites,
        },
      });
    } catch (error) {
      console.error(
        "Failed to retrieve websites:",
        error
      );
      return res.status(500).json({
        success: false,
        message: "Failed to retrieve websites",
      });
    }
  }

  /**
   * GET /api/admin/websites/pending
   *
   * Get websites waiting for approval.
   */
  async getPendingWebsites(
    req: AuthenticatedRequest,
    res: Response
  ) {
    try {
      const adminId = req.user?.userId;
      if (!adminId) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      const websites = await adminService.getPendingWebsites();

      return res.status(200).json({
        success: true,
        data: {
          count: websites.length,
          websites,
        },
      });
    } catch (error) {
      console.error(
        "Failed to retrieve pending websites:",
        error
      );
      return res.status(500).json({
        success: false,
        message: "Failed to retrieve pending websites",
      });
    }
  }

  /**
   * PATCH /api/admin/websites/:id/approve
   */
  async approveWebsite(
    req: AuthenticatedRequest,
    res: Response
  ) {
    try {
      const adminId = req.user?.userId;
      if (!adminId) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      const id = coerceIdParam(req.params.id);
      if (!id || !isValidObjectId(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid website ID",
        });
      }

      const website = await adminService.approveWebsite(
        id,
        adminId
      );

      return res.status(200).json({
        success: true,
        message: "Website approved successfully",
        data: { website },
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to approve website";

      if (isNotFoundError(error)) {
        return res.status(404).json({
          success: false,
          message: "Website not found",
        });
      }

      if (isConflictError(error)) {
        return res.status(409).json({
          success: false,
          message,
        });
      }

      return res.status(500).json({
        success: false,
        message,
      });
    }
  }

  /**
   * PATCH /api/admin/websites/:id/reject
   */
  async rejectWebsite(
    req: AuthenticatedRequest,
    res: Response
  ) {
    try {
      const adminId = req.user?.userId;
      if (!adminId) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      const id = coerceIdParam(req.params.id);
      if (!id || !isValidObjectId(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid website ID",
        });
      }

      const { reason } = req.body ?? {};
      if (typeof reason !== "string" || !reason.trim()) {
        return res.status(400).json({
          success: false,
          message: "Rejection reason is required",
        });
      }

      const website = await adminService.rejectWebsite(
        id,
        adminId,
        reason.trim()
      );

      return res.status(200).json({
        success: true,
        message: "Website rejected successfully",
        data: { website },
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to reject website";

      if (isNotFoundError(error)) {
        return res.status(404).json({
          success: false,
          message: "Website not found",
        });
      }

      if (isConflictError(error)) {
        return res.status(409).json({
          success: false,
          message,
        });
      }

      // Service throws "Rejection reason is required" if the trimmed
      // reason was empty after our check (defensive — should never fire).
      if (
        error instanceof Error &&
        error.message === "Rejection reason is required"
      ) {
        return res.status(400).json({
          success: false,
          message: "Rejection reason is required",
        });
      }

      return res.status(500).json({
        success: false,
        message,
      });
    }
  }

  /**
   * GET /api/admin/users
   */
  async getAllUsers(
    req: AuthenticatedRequest,
    res: Response
  ) {
    try {
      const adminId = req.user?.userId;
      if (!adminId) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      const users = await adminService.getAllUsers();

      return res.status(200).json({
        success: true,
        data: {
          count: users.length,
          users,
        },
      });
    } catch (error) {
      console.error(
        "Failed to retrieve users:",
        error
      );
      return res.status(500).json({
        success: false,
        message: "Failed to retrieve users",
      });
    }
  }
}

export default new AdminController();
