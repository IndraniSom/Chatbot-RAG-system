import { Request, Response } from "express";

import crawlerService from "../services/crawler/crawler.service";
import cleanerService from "../services/content/cleaner.service";
import deduplicateService from "../services/content/deduplicate.service";
import chunkerService from "../services/chunking/chunker.service";

class ChunkingController {
  async testChunking(req: Request, res: Response) {
    try {
      /**
       * Get URL and optional maxPages
       * from request body.
       */
      const { url, maxPages = 10 } = req.body;

      /**
       * Basic validation
       */
      if (!url) {
        return res.status(400).json({
          success: false,
          message: "URL is required",
        });
      }

      console.log(`🚀 Starting indexing test for: ${url}`);

      /**
       * STEP 1
       *
       * Crawl website.
       */
      const crawlResult = await crawlerService.crawl(
        url,
        maxPages
      );

      console.log(
        `🌍 Crawled ${crawlResult.pages.length} pages`
      );

      /**
       * STEP 2
       *
       * Clean extracted pages.
       */
      const cleanedPages =
        cleanerService.cleanPages(
          crawlResult.pages
        );

      console.log(
        `🧹 Cleaned ${cleanedPages.length} pages`
      );

      /**
       * STEP 3
       *
       * Remove duplicate pages.
       */
      const deduplicationResult =
        deduplicateService.deduplicate(
          cleanedPages
        );

      console.log(
        `♻️ Removed ${deduplicationResult.duplicatesRemoved} duplicate pages`
      );

      /**
       * STEP 4
       *
       * Chunk unique pages.
       */
      const chunks =
        chunkerService.chunkPages(
          deduplicationResult.pages
        );

      console.log(
        `✂️ Generated ${chunks.length} chunks`
      );

      /**
       * Return everything needed
       * to inspect the pipeline.
       */
      return res.status(200).json({
        success: true,

        data: {
          stats: {
            visitedPages:
              crawlResult.visitedCount,

            crawledPages:
              crawlResult.pages.length,

            failedPages:
              crawlResult.failedPages.length,

            cleanedPages:
              cleanedPages.length,

            duplicatesRemoved:
              deduplicationResult.duplicatesRemoved,

            uniquePages:
              deduplicationResult.uniqueCount,

            totalChunks:
              chunks.length,
          },

          failedPages:
            crawlResult.failedPages,

          chunks,
        },
      });
    } catch (error) {
      console.error(
        "❌ Chunking pipeline failed:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to crawl and chunk website",
      });
    }
  }
}

export default new ChunkingController();