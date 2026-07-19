import { Router } from "express";

import chatRoutes from "./chat";
import healthRoutes from "./health";
import browserRoutes from "./browser";
import chunkingRoutes from "./chunking";
import crawlerRoutes from "./crawler";
import embeddingRoutes from "./embedding";
import qdrantRoutes from "./qdrant";
import indexingRoutes from "./indexing";
import retrievalRoutes from "./retrieval";
import ragRoutes from "./rag";
import authRoutes from "./auth";
import websiteRoutes from "./website";
import adminRoutes from "./admin";
import widgetConfigRoutes from "./widget-config";
const router = Router();

router.use("/chat", chatRoutes);
router.use("/health", healthRoutes);
router.use("/test-browser", browserRoutes);
router.use("/test-chunking", chunkingRoutes);
router.use("/crawl", crawlerRoutes);
router.use("/test-embedding", embeddingRoutes);
router.use("/test-qdrant", qdrantRoutes);
router.use("/index-website", indexingRoutes);
router.use("/test-retrieval", retrievalRoutes);
router.use("/test-rag", ragRoutes);
router.use("/auth", authRoutes);
router.use("/websites", websiteRoutes);
router.use("/admin", adminRoutes);
/**
 * Public widget config endpoint — loaded by the chat widget embedded
 * on customer sites. Must NOT be mounted under `/auth` or behind any
 * JWT middleware.
 */
router.use("/widget-config", widgetConfigRoutes);
export default router;
