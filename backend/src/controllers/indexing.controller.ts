import { Request, Response } from "express";

import crawlerService from "../services/crawler/crawler.service";
import cleanerService from "../services/content/cleaner.service";
import deduplicateService from "../services/content/deduplicate.service";
import chunkerService from "../services/chunking/chunker.service";
import embeddingService from "../services/embedding/embedding.service";
import qdrantService from "../services/vector/qdrant.service";

class IndexingController {
  async indexWebsite(
    req: Request,
    res: Response
  ) {
    try {
      /**
       * Get input from request.
       */
      const {
  websiteId,
  url,
  maxPages = 20,
} = req.body;
if (
  !websiteId ||
  typeof websiteId !== "string"
) {
  return res.status(400).json({
    success: false,
    message: "websiteId is required",
  });
}

      /**
       * Validate URL.
       */
      if (
        !url ||
        typeof url !== "string"
      ) {
        return res.status(400).json({
          success: false,
          message: "URL is required",
        });
      }

      /**
       * Validate maxPages.
       */
      if (
        typeof maxPages !== "number" ||
        maxPages <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "maxPages must be a positive number",
        });
      }

      console.log(
        `🚀 Starting website indexing: ${url}`
      );

      /**
       * --------------------------------
       * STEP 1
       * Crawl website
       * --------------------------------
       */

      console.log(
        "🌍 Step 1: Crawling website..."
      );

      const crawlResult =
        await crawlerService.crawl(
          url,
          maxPages
        );

      console.log(
        `✅ Crawled ${crawlResult.pages.length} pages`
      );

      /**
       * Make sure we actually found pages.
       */
      if (
        crawlResult.pages.length === 0
      ) {
        return res.status(422).json({
          success: false,

          message:
            "No pages could be crawled from the website",

          data: {
            failedPages:
              crawlResult.failedPages,
          },
        });
      }

      /**
       * --------------------------------
       * STEP 2
       * Clean pages
       * --------------------------------
       */

      console.log(
        "🧹 Step 2: Cleaning content..."
      );

      const cleanedPages =
        cleanerService.cleanPages(
          crawlResult.pages
        );

      console.log(
        `✅ ${cleanedPages.length} useful pages after cleaning`
      );

      if (
        cleanedPages.length === 0
      ) {
        return res.status(422).json({
          success: false,

          message:
            "No useful content found after cleaning",
        });
      }

      /**
       * --------------------------------
       * STEP 3
       * Remove duplicate pages
       * --------------------------------
       */

      console.log(
        "♻️ Step 3: Removing duplicates..."
      );

      const deduplicationResult =
        deduplicateService.deduplicate(
          cleanedPages
        );

      const uniquePages =
        deduplicationResult.pages;

      console.log(
        `✅ ${deduplicationResult.duplicatesRemoved} duplicate pages removed`
      );

      /**
       * --------------------------------
       * STEP 4
       * Chunk content
       * --------------------------------
       */

      console.log(
        "✂️ Step 4: Creating chunks..."
      );

      const chunks =
        chunkerService.chunkPages(
          uniquePages
        );

      console.log(
        `✅ Generated ${chunks.length} chunks`
      );

      if (
        chunks.length === 0
      ) {
        return res.status(422).json({
          success: false,

          message:
            "No chunks were generated from the website",
        });
      }

      /**
       * --------------------------------
       * STEP 5
       * Generate embeddings
       * --------------------------------
       */

      console.log(
        "🧠 Step 5: Generating embeddings..."
      );

      const embeddedChunks =
        await embeddingService.embedDocuments(
          chunks
        );

      console.log(
        `✅ Generated ${embeddedChunks.length} embeddings`
      );

      if (
        embeddedChunks.length === 0
      ) {
        throw new Error(
          "Embedding service returned no embeddings"
        );
      }

      /**
       * --------------------------------
       * STEP 6
       * Store in Qdrant
       * --------------------------------
       */

      console.log(
        "📦 Step 6: Storing vectors in Qdrant..."
      );

      await qdrantService.upsertChunks(
  embeddedChunks,
  websiteId
);

      console.log(
        "🎉 Website indexing completed!"
      );

      /**
       * --------------------------------
       * Return result
       * --------------------------------
       */

      return res.status(200).json({
        success: true,

        message:
          "Website indexed successfully",

        data: {
          url,

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
              deduplicationResult
                .duplicatesRemoved,

            uniquePages:
              deduplicationResult
                .uniqueCount,

            chunks:
              chunks.length,

            embeddings:
              embeddedChunks.length,

            vectorDimension:
              embeddedChunks[0]
                .vector.length,

            storedPoints:
              embeddedChunks.length,
          },

          failedUrls:
            crawlResult.failedPages,
        },
      });
    } catch (error) {
      console.error(
        "❌ Website indexing failed:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to index website",

        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      });
    }
  }
}

export default new IndexingController();