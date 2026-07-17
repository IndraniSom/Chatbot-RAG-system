import { Response } from "express";

import { isValidObjectId } from "mongoose";

import websiteService from "../services/website/website.service";
import installationService from "../services/installation/installation.service";

import { AuthenticatedRequest } from "../middleware/auth.middleware";

import {
  coerceIdParam,
  isNotFoundError,
} from "../utils/request";

/**
 * HTTP boundary for /api/websites.
 *
 * Status-code mapping:
 *  - 200  retrieved / deleted / verified
 *  - 201  created
 *  - 400  malformed input
 *  - 401  missing auth
 *  - 403  trying to delete an approved website
 *  - 404  website not found
 *  - 409  business rule violation (e.g. installation before approval)
 *  - 500  unexpected server error
 */
class WebsiteController {
  /**
   * POST /api/websites
   */
  async createWebsite(
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

      const { name, url } = req.body ?? {};

      if (typeof name !== "string" || typeof url !== "string") {
        return res.status(400).json({
          success: false,
          message: "Website name and URL are required",
        });
      }

      const trimmedName = name.trim();
      const trimmedUrl = url.trim();

      if (!trimmedName || !trimmedUrl) {
        return res.status(400).json({
          success: false,
          message: "Website name and URL are required",
        });
      }

      const website = await websiteService.createWebsite({
        userId,
        name: trimmedName,
        url: trimmedUrl,
      });

      return res.status(201).json({
        success: true,
        message:
          "Website submitted successfully. Waiting for admin approval.",
        data: { website },
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to submit website";

      // Service-layer validation errors land here too (e.g. duplicate domain).
      return res.status(400).json({
        success: false,
        message,
      });
    }
  }

  /**
   * GET /api/websites
   */
  async getMyWebsites(
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

      const websites = await websiteService.getUserWebsites(userId);

      return res.status(200).json({
        success: true,
        data: {
          count: websites.length,
          websites,
        },
      });
    } catch (_error) {
      return res.status(500).json({
        success: false,
        message: "Failed to retrieve websites",
      });
    }
  }

  /**
   * GET /api/websites/:id
   */
  async getWebsite(
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

      const website = await websiteService.getUserWebsiteById(id, userId);

      return res.status(200).json({
        success: true,
        data: { website },
      });
    } catch (error) {
      if (isNotFoundError(error)) {
        return res.status(404).json({
          success: false,
          message: "Website not found",
        });
      }

      const message =
        error instanceof Error
          ? error.message
          : "Failed to retrieve website";

      return res.status(500).json({
        success: false,
        message,
      });
    }
  }

  /**
   * DELETE /api/websites/:id
   */
  async deleteWebsite(
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

      await websiteService.deleteWebsite(id, userId);

      return res.status(200).json({
        success: true,
        message: "Website deleted successfully",
      });
    } catch (error) {
      if (isNotFoundError(error)) {
        return res.status(404).json({
          success: false,
          message: "Website not found",
        });
      }

      if (isApprovedDeleteError(error)) {
        return res.status(403).json({
          success: false,
          message: "Approved websites cannot be deleted directly",
        });
      }

      const message =
        error instanceof Error
          ? error.message
          : "Failed to delete website";

      return res.status(500).json({
        success: false,
        message,
      });
    }
  }

  /**
   * GET /api/websites/:id/installation
   *
   * Returns the widget script + installation metadata for an owned website.
   * Only approved websites can expose the script.
   */
  async getInstallation(
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

      const installation = await installationService.getInstallation(
        id,
        userId
      );

      return res.status(200).json({
        success: true,
        data: { installation },
      });
    } catch (error) {
      if (isNotFoundError(error)) {
        return res.status(404).json({
          success: false,
          message: "Website not found",
        });
      }

      // Service throws this when the website isn't approved yet.
      if (isNotApprovedError(error)) {
        return res.status(409).json({
          success: false,
          message:
            error instanceof Error
              ? error.message
              : "Website must be approved before installing Scrappy",
        });
      }

      const message =
        error instanceof Error
          ? error.message
          : "Failed to retrieve installation information";

      return res.status(500).json({
        success: false,
        message,
      });
    }
  }

  /**
   * POST /api/websites/:id/verify-installation
   *
   * Headless Chromium visits the website and confirms the Scrappy script
   * is present with the matching websiteId.
   */
  async verifyInstallation(
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

      const result = await installationService.verifyInstallation(
        id,
        userId
      );

      return res.status(200).json({
        success: true,
        message: result.message,
        data: result,
      });
    } catch (error) {
      if (isNotFoundError(error)) {
        return res.status(404).json({
          success: false,
          message: "Website not found",
        });
      }

      if (isNotApprovedError(error)) {
        return res.status(409).json({
          success: false,
          message:
            error instanceof Error
              ? error.message
              : "Website must be approved before verifying installation",
        });
      }

      const message =
        error instanceof Error
          ? error.message
          : "Installation verification failed";

      return res.status(500).json({
        success: false,
        message,
      });
    }
  }
}

/**
 * Service throws this when a user tries to delete an already-approved
 * website. Lives next to its caller rather than in the shared util because
 * it's the only consumer.
 */
function isApprovedDeleteError(error: unknown): boolean {
  return (
    error instanceof Error &&
    error.message === "Approved websites cannot be deleted directly"
  );
}

/**
 * InstallationService throws these when a customer tries to install /
 * verify the widget before admin approval.
 */
function isNotApprovedError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return (
    error.message === "Website must be approved before installing Scrappy" ||
    error.message === "Website must be approved before verifying installation"
  );
}

export default new WebsiteController();
