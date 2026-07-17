import { chromium } from "playwright";

import Website from "../../models/website";

class InstallationService {
  /**
   * Get the configured widget URL.
   */
  private getWidgetScriptUrl(): string {
    const widgetScriptUrl =
      process.env.WIDGET_SCRIPT_URL;

    if (!widgetScriptUrl) {
      throw new Error(
        "WIDGET_SCRIPT_URL is not configured"
      );
    }

    return widgetScriptUrl;
  }

  /**
   * Generate installation script.
   *
   * IMPORTANT:
   * websiteId is public and is used by:
   *
   * - Widget
   * - Chat API
   * - Qdrant tenant filtering
   */
  generateInstallationScript(
    websiteId: string
  ): string {
    const widgetScriptUrl =
      this.getWidgetScriptUrl();

    return `<script
  src="${widgetScriptUrl}"
  data-website-id="${websiteId}"
></script>`;
  }

  /**
   * Return installation information
   * for an owned website.
   */
  async getInstallation(
    websiteMongoId: string,
    userId: string
  ) {
    const website =
      await Website.findOne({
        _id: websiteMongoId,
        userId,
      });

    if (!website) {
      throw new Error(
        "Website not found"
      );
    }

    /**
     * Don't expose the script before
     * admin approval.
     */
    if (
      website.status !==
      "APPROVED"
    ) {
      throw new Error(
        "Website must be approved before installing Scrappy"
      );
    }

    const script =
      this.generateInstallationScript(
        website.websiteId
      );

    return {
      websiteId:
        website.websiteId,

      websiteName:
        website.name,

      url:
        website.url,

      domain:
        website.domain,

      widgetStatus:
        website.widgetStatus,

      script,
    };
  }

  /**
   * Verify that the Scrappy widget
   * has been installed on the website.
   */
  async verifyInstallation(
    websiteMongoId: string,
    userId: string
  ) {
    /**
     * Always get the URL and websiteId
     * from MongoDB.
     *
     * Never trust them from req.body.
     */
    const website =
      await Website.findOne({
        _id: websiteMongoId,
        userId,
      });

    if (!website) {
      throw new Error(
        "Website not found"
      );
    }

    if (
      website.status !==
      "APPROVED"
    ) {
      throw new Error(
        "Website must be approved before verifying installation"
      );
    }

    console.log(
      `🔍 Verifying Scrappy installation: ${website.url}`
    );

    let browser;

    try {
      browser =
        await chromium.launch({
          headless: true,
        });

      const page =
        await browser.newPage();

      /**
       * Open the approved website.
       */
      await page.goto(
        website.url,
        {
          waitUntil:
            "domcontentloaded",

          timeout:
            30000,
        }
      );

      /**
       * Give client-rendered websites
       * a short time to load scripts.
       */
      await page.waitForTimeout(
        1500
      );

      /**
       * Find a script containing
       * this website's exact websiteId.
       */
      const scriptSelector =
        `script[data-website-id="${website.websiteId}"]`;

      const scriptElement =
        await page.$(
          scriptSelector
        );

      /**
       * Script not found.
       */
      if (!scriptElement) {
        website.widgetStatus =
          "NOT_INSTALLED";

        website.isActive =
          false;

        await website.save();

        console.log(
          "❌ Scrappy widget script not found"
        );

        return {
          installed: false,

          widgetStatus:
            website.widgetStatus,

          message:
            "Scrappy installation could not be verified. Make sure the script is installed on your website.",
        };
      }

      /**
       * Read script src.
       */
      const scriptSrc =
        await scriptElement.getAttribute(
          "src"
        );

      const expectedScriptUrl =
        this.getWidgetScriptUrl();

      /**
       * Validate both:
       *
       * 1. websiteId
       * 2. widget script source
       */
      if (
        !scriptSrc ||
        !this.isExpectedWidgetScript(
          scriptSrc,
          expectedScriptUrl,
          website.url
        )
      ) {
        website.widgetStatus =
          "NOT_INSTALLED";

        website.isActive =
          false;

        await website.save();

        return {
          installed: false,

          widgetStatus:
            website.widgetStatus,

          message:
            "A Scrappy-like script was found, but the widget source is invalid.",
        };
      }

      /**
       * Installation confirmed.
       */
      website.widgetStatus =
        "INSTALLED";

      await website.save();

      console.log(
        `✅ Scrappy installation verified: ${website.domain}`
      );

      return {
        installed: true,

        widgetStatus:
          website.widgetStatus,

        websiteId:
          website.websiteId,

        message:
          "Scrappy is successfully installed on your website.",
      };
    } catch (error) {
      console.error(
        "❌ Installation verification failed:",
        error
      );

      throw new Error(
        "Unable to verify the Scrappy installation"
      );
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  /**
   * Compare the discovered script URL
   * with the configured widget URL.
   *
   * This also handles relative URLs.
   */
  private isExpectedWidgetScript(
    actualSrc: string,
    expectedSrc: string,
    websiteUrl: string
  ): boolean {
    try {
      const actualUrl =
        new URL(
          actualSrc,
          websiteUrl
        );

      const expectedUrl =
        new URL(
          expectedSrc
        );

      return (
        actualUrl.href ===
        expectedUrl.href
      );
    } catch {
      return false;
    }
  }
}

export default new InstallationService();