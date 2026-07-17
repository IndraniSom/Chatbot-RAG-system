import { Router } from "express";

import chunkingController from "../controllers/chunking.controller";

const router = Router();

router.post("/", (req, res) =>
  chunkingController.testChunking(req, res)
);

export default router;