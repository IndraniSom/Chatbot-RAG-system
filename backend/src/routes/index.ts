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
export default router;