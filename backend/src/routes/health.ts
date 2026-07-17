import { Router } from "express";

const router = Router();

router.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "Backend is healthy 🚀",
    uptime: process.uptime(),
  });
});

export default router;