import { Router } from "express";
import browserController from "../controllers/browsercontroller";

const router = Router();

router.post("/", (req, res) =>
  browserController.testBrowser(req, res)
);

export default router;