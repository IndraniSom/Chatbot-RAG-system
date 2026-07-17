import { Router } from "express";
import chatController from "../controllers/chatcontrollers";

const router = Router();

router.post("/", (req, res) => chatController.chat(req, res));

export default router;