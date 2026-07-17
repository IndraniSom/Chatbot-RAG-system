import { Router } from "express";

import ragController from "../controllers/rag.controller";

const router = Router();

router.post(
  "/",
  (req, res) =>
    ragController.testRAG(
      req,
      res
    )
);

export default router;