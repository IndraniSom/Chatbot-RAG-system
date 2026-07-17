import crypto from "crypto";

import { CleanedPage } from "./cleaner.service";

export interface DeduplicationResult {
  pages: CleanedPage[];
  originalCount: number;
  uniqueCount: number;
  duplicatesRemoved: number;
}

class DeduplicateService {
  /**
   * Normalize content before generating a hash.
   *
   * This helps us identify pages that contain
   * the same content with small whitespace differences.
   */
  private normalizeContent(content: string): string {
    return content
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();
  }

  /**
   * Generate a SHA-256 hash from page content.
   *
   * Same content will always produce the same hash.
   */
  private generateContentHash(content: string): string {
    const normalizedContent = this.normalizeContent(content);

    return crypto
      .createHash("sha256")
      .update(normalizedContent)
      .digest("hex");
  }

  /**
   * Remove pages containing duplicate content.
   */
  deduplicate(pages: CleanedPage[]): DeduplicationResult {
    const seenHashes = new Set<string>();

    const uniquePages: CleanedPage[] = [];

    for (const page of pages) {
      const hash = this.generateContentHash(page.content);

      // We already stored a page with identical content
      if (seenHashes.has(hash)) {
        continue;
      }

      // Remember this content
      seenHashes.add(hash);

      // Keep this page
      uniquePages.push(page);
    }

    return {
      pages: uniquePages,

      originalCount: pages.length,

      uniqueCount: uniquePages.length,

      duplicatesRemoved:
        pages.length - uniquePages.length,
    };
  }
}

export default new DeduplicateService();