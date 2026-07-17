import { ExtractedPage } from "../crawler/extractor.service";

/**
 * This is the final structure of a page
 * after cleaning.
 *
 * We remove `links` because links were only
 * required by the crawler to discover pages.
 */
export interface CleanedPage {
  url: string;
  title: string;
  description: string;
  language: string;
  content: string;
}

class CleanerService {
  /**
   * Clean the main page content.
   */
  private cleanContent(content: string): string {
    if (!content) {
      return "";
    }

    return content
      // Convert Windows line endings to standard line endings
      .replace(/\r\n/g, "\n")

      // Replace tabs with spaces
      .replace(/\t/g, " ")

      // Replace multiple spaces with one space
      .replace(/[ ]{2,}/g, " ")

      // Remove spaces before new lines
      .replace(/[ \t]+\n/g, "\n")

      // Remove spaces after new lines
      .replace(/\n[ \t]+/g, "\n")

      // Maximum two consecutive new lines
      .replace(/\n{3,}/g, "\n\n")

      // Remove spaces from beginning and end
      .trim();
  }

  /**
   * Clean short text fields like
   * title and description.
   */
  private cleanText(text: string): string {
    if (!text) {
      return "";
    }

    return text
      .replace(/\s+/g, " ")
      .trim();
  }

  /**
   * Check whether the page contains
   * enough useful content.
   *
   * Very small pages are usually:
   *
   * - Error pages
   * - Empty pages
   * - Login pages
   * - Redirect pages
   */
  private isUsefulContent(content: string): boolean {
    const minimumContentLength = 50;

    return content.length >= minimumContentLength;
  }

  /**
   * Main method.
   *
   * Takes one ExtractedPage
   * and returns one CleanedPage.
   *
   * Returns null if the page does not
   * contain enough useful content.
   */
  clean(page: ExtractedPage): CleanedPage | null {
    const content = this.cleanContent(page.content);

    // Ignore pages without meaningful content
    if (!this.isUsefulContent(content)) {
      return null;
    }

    return {
      url: page.url,

      title: this.cleanText(page.title),

      description: this.cleanText(page.description),

      language: page.language || "en",

      content,
    };
  }

  /**
   * Clean multiple pages returned
   * by the crawler.
   */
  cleanPages(pages: ExtractedPage[]): CleanedPage[] {
    const cleanedPages: CleanedPage[] = [];

    for (const page of pages) {
      const cleanedPage = this.clean(page);

      if (cleanedPage) {
        cleanedPages.push(cleanedPage);
      }
    }

    return cleanedPages;
  }
}

export default new CleanerService();