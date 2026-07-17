import {
  NextFunction,
  Request,
  Response,
} from "express";

import jwt from "jsonwebtoken";

export interface AuthenticatedRequest
  extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

interface TokenPayload {
  userId: string;
  role: string;
}

export const authenticateUser =
  (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      /**
       * Expected header:
       *
       * Authorization:
       * Bearer eyJhbGciOi...
       */
      const authorization =
        req.headers.authorization;

      if (
        !authorization ||
        !authorization.startsWith(
          "Bearer "
        )
      ) {
        return res.status(401).json({
          success: false,

          message:
            "Authentication required",
        });
      }

      /**
       * Remove "Bearer ".
       */
      const token =
        authorization.split(
          " "
        )[1];

      if (!token) {
        return res.status(401).json({
          success: false,

          message:
            "Authentication required",
        });
      }

      const secret =
        process.env.JWT_SECRET;

      if (!secret) {
        throw new Error(
          "JWT_SECRET is not configured"
        );
      }

      /**
       * Verify JWT signature
       * and expiration.
       */
      const decoded =
        jwt.verify(
          token,
          secret
        ) as TokenPayload;

      /**
       * Attach authenticated
       * user information.
       */
      req.user = {
        userId:
          decoded.userId,

        role:
          decoded.role,
      };

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,

        message:
          "Invalid or expired authentication token",
      });
    }
  };