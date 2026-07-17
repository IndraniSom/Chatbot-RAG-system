import browserService from "./browser.service";
import extractorService, { ExtractedPage } from "./extractor.service";
import urlService from "./url.service";
import crawlerDb from "./db.service";

export interface CrawlResult {
  pages: ExtractedPage[];
  visitedCount: number;
  failedPages: string[];
  /** Pages that were successfully written to the local DB. */
  indexedCount: number;
}

class CrawlerService {
  /**
   * BFS crawl starting from `startUrl`, capped at `maxPages`. For each page:
   *   1. openWebsite() via Playwright
   *   2. extract() via cheerio + Readability
   *   3. upsert into the local DB
   *   4. enqueue discovered internal links
   */
  async crawl(startUrl: string, maxPages: number = 20): Promise<CrawlResult> {
    const queue: string[] = [startUrl];
    const visited = new Set<string>();
    const pages: ExtractedPage[] = [];
    const failedPages: string[] = [];
    let indexedCount = 0;

    while (queue.length > 0 && pages.length < maxPages) {
      const currentUrl = queue.shift();
      if (!currentUrl) continue;
      if (visited.has(currentUrl)) continue;

      visited.add(currentUrl);

      console.log(`🌍 Crawling: ${currentUrl}`);

      try {
        const browserPage = await browserService.openWebsite(currentUrl);
        const extractedPage = extractorService.extract(browserPage);

        pages.push(extractedPage);

        const stored = crawlerDb.upsertPage(extractedPage);
        if (stored) indexedCount += 1;

        const discoveredLinks = urlService.prepareLinks(
          extractedPage.url,
          extractedPage.links
        );

        for (const link of discoveredLinks) {
          if (!visited.has(link) && !queue.includes(link)) {
            queue.push(link);
          }
        }

        console.log(
          `✅ ${extractedPage.title} | Queue: ${queue.length} | Pages: ${pages.length}`
        );
      } catch (error) {
        console.error(`❌ Failed: ${currentUrl}`, error);
        failedPages.push(currentUrl);
      }
    }

    return {
      pages,
      visitedCount: visited.size,
      failedPages,
      indexedCount,
    };
  }

  /** Flush any pending DB writes so a caller can be sure they hit disk. */
  async flush() {
    await crawlerDb.flush();
  }
}

export default new CrawlerService();