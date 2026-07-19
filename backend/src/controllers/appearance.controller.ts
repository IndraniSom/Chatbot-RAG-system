import { Response } from "express";

import { isValidObjectId } from "mongoose";

import Website from "../models/website";

import appearanceService, {
  AppearanceValidationError,
  LogoRejectionError,
} from "../services/appearance/appearance.service";

import {
  buildSignedUploadParams,
  isCloudinaryConfigured,
} from "../config/cloudinary";

import { AuthenticatedRequest } from "../middleware/auth.middleware";

import { coerceIdParam } from "../utils/request";

/**
 * HTTP boundary for owner-facing appearance endpoints:
 *
 *  - PATCH  /api/websites/:id/appearance   (colors + removeLogo)
 *  - POST   /api/websites/:id/logo/signature
 *  - POST   /api/websites/:id/logo/complete
 *  - DELETE /api/websites/:id/logo
 *
 * Status-code mapping:
 *  - 200  success / signed params returned
 *  - 400  malformed payload
 *  - 401  missing auth
 *  - 404  website not found (or not owned)
 *  - 422  logo upload rejected by validation (unsupported format / too big)
 *  - 503  Cloudinary not configured on this backend
 */
class AppearanceController {
  /**
   * PATCH /api/websites/:id/appearance
   *
   * Body: `{ primaryColor?, surfaceColor?, removeLogo? }`.
   *
   * Echoes the updated appearance so the dashboard can refresh
   * without re-reading.
   */
  async updateAppearance(
    req: AuthenticatedRequest,
    res: Response
  ) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
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

      const appearance =
        await appearanceService.updateAppearance(
          id,
          userId,
          req.body
        );

      return res.status(200).json({
        success: true,
        message: "Appearance updated",
        data: { appearance },
      });
    } catch (error) {
      if (
        error instanceof AppearanceValidationError
      ) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      if (
        error instanceof Error &&
        error.message === "Website not found"
      ) {
        return res.status(404).json({
          success: false,
          message: "Website not found",
        });
      }

      return res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to update appearance",
      });
    }
  }

  /**
   * POST /api/websites/:id/logo/signature
   *
   * Mints a short-lived, scoped signature for browser-direct uploads.
   *
   * Returns 503 if Cloudinary isn't configured on this server.
   */
  async createLogoSignature(
    req: AuthenticatedRequest,
    res: Response
  ) {
    /**
     * Fast-fail if Cloudinary isn't configured so we don't even
     * bother hitting the database for an unused signature.
     */
    if (!isCloudinaryConfigured()) {
      return res.status(503).json({
        success: false,
        message:
          "Logo uploads are temporarily unavailable. Cloudinary is not configured on this server.",
      });
    }

    try {
      const userId = req.user?.userId;

      if (!userId) {
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

      /**
       * Confirm ownership and grab the public websiteId — that's the
       * scope baked into the signed payload so uploads can only be
       * authorized for this customer's chatbot.
       */
      const website = await Website.findOne({
        _id: id,
        userId,
      }).select("websiteId");

      if (!website) {
        return res.status(404).json({
          success: false,
          message: "Website not found",
        });
      }

      const params = buildSignedUploadParams(
        website.websiteId
      );

      return res.status(200).json({
        success: true,
        data: { params },
      });
    } catch (error) {
      if (!isCloudinaryConfigured()) {
        return res.status(503).json({
          success: false,
          message:
            "Logo uploads are temporarily unavailable. Cloudinary is not configured on this server.",
        });
      }

      if (
        error instanceof Error &&
        error.message === "Website not found"
      ) {
        return res.status(404).json({
          success: false,
          message: "Website not found",
        });
      }

      return res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to sign upload parameters",
      });
    }
  }

  /**
   * POST /api/websites/:id/logo/complete
   *
   * Body: `{ publicId, timestamp, signature }`.
   *
   * The controller intentionally does NOT trust any client-side
   * metadata; the service re-fetches the asset from Cloudinary and
   * validates it before persisting the optimized secure URL.
   */
  async completeLogoUpload(
    req: AuthenticatedRequest,
    res: Response
  ) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
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

      const appearance =
        await appearanceService.completeLogoUpload(
          id,
          userId,
          req.body
        );

      return res.status(200).json({
        success: true,
        message: "Logo uploaded successfully",
        data: { appearance },
      });
    } catch (error) {
      if (
        error instanceof AppearanceValidationError
      ) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      if (error instanceof LogoRejectionError) {
        return res.status(422).json({
          success: false,
          message: error.message,
        });
      }

      if (
        error instanceof Error &&
        error.message === "Website not found"
      ) {
        return res.status(404).json({
          success: false,
          message: "Website not found",
        });
      }

      return res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to complete logo upload",
      });
    }
  }

  /**
   * DELETE /api/websites/:id/logo
   *
   * Clear the stored logo URL + best-effort destroy the asset.
   */
  async removeLogo(
    req: AuthenticatedRequest,
    res: Response
  ) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
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

      const appearance =
        await appearanceService.updateAppearance(
          id,
          userId,
          { removeLogo: true }
        );

      return res.status(200).json({
        success: true,
        message: "Logo removed",
        data: { appearance },
      });
    } catch (error) {
      if (
        error instanceof AppearanceValidationError
      ) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      if (
        error instanceof Error &&
        error.message === "Website not found"
      ) {
        return res.status(404).json({
          success: false,
          message: "Website not found",
        });
      }

      return res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to remove logo",
      });
    }
  }
}

export default new AppearanceController();
