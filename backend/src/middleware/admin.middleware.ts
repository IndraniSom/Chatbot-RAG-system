import {
  NextFunction,
  Response,
} from "express";

import {
  AuthenticatedRequest,
} from "./auth.middleware";

export const requireAdmin =
  (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    if (
      !req.user ||
      req.user.role !== "ADMIN"
    ) {
      return res.status(403).json({
        success: false,

        message:
          "Admin access required",
      });
    }

    next();
  };