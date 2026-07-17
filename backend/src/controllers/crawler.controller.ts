import { Request, Response } from "express";
import crawlerService from "../services/crawler/crawler.service";
import crawlerDb from "../services/crawler/db.service";

class CrawlerController {
  /**
   * POST /api/crawl
   * Body: { url: string, maxPages?: number }
   * Starts a BFS crawl from the seed URL, persists each page, and returns a
   * summary of what was visited + indexed.
   */
  async crawl(req: Request, res: Response) {
    try {
      const { url, maxPages } = req.body ?? {};
      if (!url || typeof url !== "string") {
        return res.status(400).json({
          success: false,
          error: "url is required and must be a string",
        });
      }

      let parsed: URL;
      try {
        parsed = new URL(url);
      } catch {
        return res.status(400).json({
          success: false,
          error: "url is not a valid URL",
        });
      }
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        return res.status(400).json({
          success: false,
          error: "Only http(s) URLs are supported",
        });
      }

      const limit = Math.max(
        1,
        Math.min(Number.isFinite(+maxPages) ? +maxPages : 20, 100)
      );

      const result = await crawlerService.crawl(url, limit);
      await crawlerService.flush();

      return res.status(200).json({
        success: true,
        data: {
          startUrl: url,
          maxPages: limit,
          pages: result.pages.map((p) => ({
            url: p.url,
            title: p.title,
            description: p.description,
            language: p.language,
          })),
          visitedCount: result.visitedCount,
          indexedCount: result.indexedCount,
          failedPages: result.failedPages,
        },
      });
    } catch (err) {
      console.error("[/api/crawl]", err);
      return res.status(500).json({
        success: false,
        error: "Crawl failed",
      });
    }
  }

  /**
   * GET /api/pages
   * Returns all pages indexed so far.
   */
  async listPages(_req: Request, res: Response) {
    return res.status(200).json({
      success: true,
      data: {
        count: crawlerDb.count(),
        pages: crawlerDb.listPages(),
      },
    });
  }

  /**
   * GET /api/pages/:url
   * Returns a single page (URL must be URL-encoded).
   */
  async getPage(req: Request, res: Response) {
    const raw = req.params.url;
    const url = Array.isArray(raw) ? raw[0] : decodeURIComponent(raw);
    const page = crawlerDb.getPage(url);
    if (!page) {
      return res.status(404).json({
        success: false,
        error: "Page not found",
      });
    }
    return res.status(200).json({ success: true, data: page });
  }

  /**
   * DELETE /api/pages
   * Wipes the local database.
   */
  async clearPages(_req: Request, res: Response) {
    crawlerDb.clear();
    await crawlerDb.flush();
    return res.status(200).json({
      success: true,
      data: { count: 0, pages: [] },
    });
  }

  /**
   * GET /api/search?q=...
   * Naive substring search across all indexed pages.
   */
  async search(req: Request, res: Response) {
    const q = String(req.query.q ?? "").trim();
    const rawLimit = Array.isArray(req.query.limit)
      ? req.query.limit[0]
      : req.query.limit;
    const limit = Math.max(
      1,
      Math.min(Number.isFinite(+rawLimit!) ? +rawLimit! : 10, 50)
    );
    if (!q) {
      return res.status(400).json({
        success: false,
        error: "Query parameter 'q' is required",
      });
    }
    const hits = crawlerDb.search(q, limit);
    return res.status(200).json({
      success: true,
      data: { query: q, count: hits.length, hits },
    });
  }
}

export default new CrawlerController();