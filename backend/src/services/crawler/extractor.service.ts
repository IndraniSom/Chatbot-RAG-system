import * as cheerio from "cheerio";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";

import { BrowserResult } from "./browser.service";

export interface ExtractedPage {
  url: string;
  title: string;
  description: string;
  language: string;
  content: string;
  links: string[];
}

class ExtractorService {
  /**
   * Extract page title
   */
  private getTitle($: cheerio.CheerioAPI): string {
    return $("title").text().trim();
  }

  /**
   * Extract meta description
   */
  private getDescription($: cheerio.CheerioAPI): string {
    return (
      $('meta[name="description"]').attr("content")?.trim() || ""
    );
  }

  /**
   * Extract html language
   */
  private getLanguage($: cheerio.CheerioAPI): string {
    return $("html").attr("lang") || "en";
  }

  /**
   * Extract readable article/content
   */
  private getContent(html: string): string {
    const dom = new JSDOM(html);

    const reader = new Readability(dom.window.document);

    const article = reader.parse();

    if (!article) {
      return "";
    }

    return (article.textContent ?? "").trim();
  }

  /**
   * Extract all links
   */
  private getLinks($: cheerio.CheerioAPI): string[] {
    const links = new Set<string>();

    $("a[href]").each((_, element) => {
      const href = $(element).attr("href");

      if (!href) return;

      links.add(href);
    });

    return Array.from(links);
  }

  /**
   * Main extractor
   */
  extract(page: BrowserResult): ExtractedPage {
    const $ = cheerio.load(page.html);

    return {
      url: page.url,

      title: this.getTitle($),

      description: this.getDescription($),

      language: this.getLanguage($),

      content: this.getContent(page.html),

      links: this.getLinks($),
    };
  }
}

export default new ExtractorService();