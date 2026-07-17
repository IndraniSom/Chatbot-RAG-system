import { Router } from "express";
import embeddingController from "../controllers/embedding.controller";

const router = Router();

router.post(
  "/",
  (req, res) =>
    embeddingController.testEmbedding(
      req,
      res
    )
);

export default router;