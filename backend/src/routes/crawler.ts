import { Router } from "express";
import crawlerController from "../controllers/crawler.controller";

const router = Router();

router.post("/", (req, res) => crawlerController.crawl(req, res));
router.get("/pages", (req, res) => crawlerController.listPages(req, res));
router.delete("/pages", (req, res) => crawlerController.clearPages(req, res));
router.get("/search", (req, res) => crawlerController.search(req, res));
router.get("/pages/:url", (req, res) => crawlerController.getPage(req, res));

export default router;