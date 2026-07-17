import { Router } from "express";
import qdrantController from "../controllers/qdrant.controller";

const router = Router();

router.get(
  "/",
  (req, res) =>
    qdrantController.testQdrant(
      req,
      res
    )
);

export default router;