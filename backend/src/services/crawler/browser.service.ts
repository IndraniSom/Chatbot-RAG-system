import { chromium } from "playwright";

export interface BrowserResult {
  url: string;
  title: string;
  html: string;
}

class BrowserService {
  async openWebsite(url: string): Promise<BrowserResult> {
    const browser = await chromium.launch({
      headless: true, // No visible browser window
    });

    const page = await browser.newPage();

    try {
      await page.goto(url, {
        waitUntil: "networkidle",
        timeout: 30000,
      });

      const html = await page.content();
      const title = await page.title();
      const finalUrl = page.url();

      return {
        url: finalUrl,
        title,
        html,
      };
    } finally {
      // This always runs, even if page.goto() throws an error
      await browser.close();
    }
  }
}

export default new BrowserService();