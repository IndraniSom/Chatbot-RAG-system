import {
  Request,
  Response,
} from "express";

import authService from "../services/auth/auth.service";

import User from "../models/user";

import {
  AuthenticatedRequest,
} from "../middleware/auth.middleware";

class AuthController {
  /**
   * POST /api/auth/register
   */
  async register(
    req: Request,
    res: Response
  ) {
    try {
      const {
        name,
        email,
        password,
      } = req.body;

      if (
        typeof name !== "string" ||
        typeof email !== "string" ||
        typeof password !== "string"
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Name, email and password are required",
        });
      }

      const result =
        await authService.register({
          name,
          email,
          password,
        });

      return res.status(201).json({
        success: true,

        message:
          "Account created successfully",

        data:
          result,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Registration failed";

      /**
       * For now we return 400 for
       * registration validation errors.
       *
       * Later you can introduce custom
       * application error classes.
       */
      return res.status(400).json({
        success: false,
        message,
      });
    }
  }

  /**
   * POST /api/auth/login
   */
  async login(
    req: Request,
    res: Response
  ) {
    try {
      const {
        email,
        password,
      } = req.body;

      if (
        typeof email !== "string" ||
        typeof password !== "string"
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Email and password are required",
        });
      }

      const result =
        await authService.login({
          email,
          password,
        });

      return res.status(200).json({
        success: true,

        message:
          "Login successful",

        data:
          result,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Login failed";

      return res.status(401).json({
        success: false,
        message,
      });
    }
  }

  /**
   * GET /api/auth/me
   *
   * Protected route.
   */
  async me(
    req: AuthenticatedRequest,
    res: Response
  ) {
    try {
      const userId =
        req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,

          message:
            "Authentication required",
        });
      }

      const user =
        await User.findById(
          userId
        ).select(
          "-passwordHash"
        );

      if (!user) {
        return res.status(404).json({
          success: false,

          message:
            "User not found",
        });
      }

      return res.status(200).json({
        success: true,

        data: {
          user,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,

        message:
          "Failed to retrieve user",
      });
    }
  }
}

export default new AuthController();