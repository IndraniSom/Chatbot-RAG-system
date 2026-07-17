import { Router } from "express";

import indexingController from "../controllers/indexing.controller";

const router = Router();

router.post(
  "/",
  (req, res) =>
    indexingController.indexWebsite(
      req,
      res
    )
);

export default router;