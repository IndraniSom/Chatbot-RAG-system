import {
  Router,
} from "express";

import authController from "../controllers/auth.controller";

import {
  authenticateUser,
} from "../middleware/auth.middleware";

const router =
  Router();

/**
 * Public
 */
router.post(
  "/register",
  (req, res) =>
    authController.register(
      req,
      res
    )
);

router.post(
  "/login",
  (req, res) =>
    authController.login(
      req,
      res
    )
);

/**
 * Protected
 */
router.get(
  "/me",
  authenticateUser,
  (req, res) =>
    authController.me(
      req,
      res
    )
);

export default router;