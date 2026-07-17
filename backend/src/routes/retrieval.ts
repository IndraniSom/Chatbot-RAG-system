import { Router } from "express";

import retrievalController from "../controllers/retrieval.controller";

const router = Router();

router.post(
  "/",
  (req, res) =>
    retrievalController.testRetrieval(
      req,
      res
    )
);

export default router;