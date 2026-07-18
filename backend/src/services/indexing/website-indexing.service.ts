import Website from "../../models/website";

import crawlerService from "../crawler/crawler.service";
import cleanerService from "../content/cleaner.service";
import deduplicateService from "../content/deduplicate.service";
import chunkerService from "../chunking/chunker.service";
import embeddingService from "../embedding/embedding.service";
import qdrantService from "../vector/qdrant.service";
import redisLockService from "../lock/redis-lock.service";
export interface WebsiteIndexingOptions {
  maxPages?: number;
  force?: boolean;
  onProgress?: (progress: number) => Promise<void> | void;
}

export interface WebsiteIndexingResult {
  visitedPages: number;
  crawledPages: number;
  cleanedPages: number;
  uniquePages: number;
  duplicatesRemoved: number;
  chunks: number;
  embeddings: number;
  storedPoints: number;
  failedPages: string[];
}

class WebsiteIndexingService {
    
  async indexWebsite(
    websiteId: string,
    options: WebsiteIndexingOptions = {}
  ): Promise<WebsiteIndexingResult> {
    const maxPages = options.maxPages ?? 20;

    const website = await Website.findOne({
      websiteId,
    });

    if (!website) {
      throw new Error("Website not found.");
    }

    try {
      /**
       * Mark website as indexing.
       */
      website.indexingStatus = "INDEXING";

      // Requires lastIndexingError field in Website model
      website.lastIndexingError = undefined;

      await website.save();

      console.log(
        `🚀 Starting indexing for ${website.url}`
      );

      //-------------------------------------
      // STEP 1
      //-------------------------------------

      console.log("🌍 Crawling...");

      const crawlResult =
        await crawlerService.crawl(
          website.url,
          maxPages
        );

      if (!crawlResult.pages.length) {
        throw new Error(
          "Crawler returned zero pages."
        );
      }

      //-------------------------------------
      // STEP 2
      //-------------------------------------

      console.log("🧹 Cleaning...");

      const cleanedPages =
        cleanerService.cleanPages(
          crawlResult.pages
        );

      if (!cleanedPages.length) {
        throw new Error(
          "No useful content after cleaning."
        );
      }

      //-------------------------------------
      // STEP 3
      //-------------------------------------

      console.log(
        "♻ Removing duplicates..."
      );

      const deduplicationResult =
        deduplicateService.deduplicate(
          cleanedPages
        );

      //-------------------------------------
      // STEP 4
      //-------------------------------------

      console.log("✂ Chunking...");

      const chunks =
        chunkerService.chunkPages(
          deduplicationResult.pages
        );

      if (!chunks.length) {
        throw new Error(
          "No chunks generated."
        );
      }

      //-------------------------------------
      // STEP 5
      //-------------------------------------

      console.log("🧠 Embedding...");

      const embeddedChunks =
        await embeddingService.embedDocuments(
          chunks
        );

      if (!embeddedChunks.length) {
        throw new Error(
          "Embedding generation failed."
        );
      }

      //-------------------------------------
      // STEP 6
      //-------------------------------------

      
      console.log(
  "🗑 Removing previous vectors..."
);
const shouldDelete =
options.force ?? true;
if (shouldDelete) {
  await qdrantService.deleteWebsiteVectors(
    website.websiteId
  );
}
console.log(
        "📦 Uploading vectors..."
      );
      await qdrantService.upsertChunks(
        embeddedChunks,
        website.websiteId
      );

      //-------------------------------------
      // SUCCESS
      //-------------------------------------

      website.indexingStatus = "INDEXED";
      website.lastIndexedAt = new Date();
      website.lastIndexingError = undefined;
      website.isActive = true;

      await website.save();

      console.log(
        "✅ Website indexing completed successfully."
      );

      return {
        visitedPages:
          crawlResult.visitedCount,

        crawledPages:
          crawlResult.pages.length,

        cleanedPages:
          cleanedPages.length,

        uniquePages:
          deduplicationResult.uniqueCount,

        duplicatesRemoved:
          deduplicationResult.duplicatesRemoved,

        chunks:
          chunks.length,

        embeddings:
          embeddedChunks.length,

        storedPoints:
          embeddedChunks.length,

        failedPages:
          crawlResult.failedPages,
      };
    } catch (error) {
      website.indexingStatus = "FAILED";

      website.lastIndexingError =
        error instanceof Error
          ? error.message
          : "Unknown error";

      await website.save();

      console.error(
        "❌ Website indexing failed:",
        error
      );

      throw error;
    }
  }
}

export default new WebsiteIndexingService();