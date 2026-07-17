import crypto from "crypto";

import Website from "../../models/website";

export interface CreateWebsiteInput {
  userId: string;
  name: string;
  url: string;
}

class WebsiteService {
  /**
   * Normalize and validate website URL.
   *
   * Input:
   * runforsafefood.org
   *
   * Output:
   * https://runforsafefood.org/
   */
  private normalizeUrl(
    inputUrl: string
  ): URL {
    let url =
      inputUrl.trim();

    if (!url) {
      throw new Error(
        "Website URL is required"
      );
    }

    /**
     * If protocol is missing,
     * default to HTTPS.
     */
    if (
      !url.startsWith("http://") &&
      !url.startsWith("https://")
    ) {
      url =
        `https://${url}`;
    }

    try {
      const parsedUrl =
        new URL(url);

      /**
       * Only HTTP/HTTPS websites
       * are supported.
       */
      if (
        parsedUrl.protocol !==
          "http:" &&
        parsedUrl.protocol !==
          "https:"
      ) {
        throw new Error();
      }

      return parsedUrl;
    } catch {
      throw new Error(
        "Please provide a valid website URL"
      );
    }
  }

  /**
   * Generate public website ID.
   *
   * Example:
   * ws_4f28b13a9d52
   */
  private generateWebsiteId():
    string {
    return `ws_${crypto
      .randomBytes(8)
      .toString("hex")}`;
  }

  /**
   * Create a new website submission.
   */
  async createWebsite(
    input: CreateWebsiteInput
  ) {
    const name =
      input.name.trim();

    if (!name) {
      throw new Error(
        "Website name is required"
      );
    }

    /**
     * Validate and normalize URL.
     */
    const parsedUrl =
      this.normalizeUrl(
        input.url
      );

    /**
     * hostname removes:
     *
     * https://
     * paths
     * query params
     *
     * Example:
     * www.runforsafefood.org
     */
    const hostname =
      parsedUrl.hostname
        .toLowerCase();

    /**
     * Normalize www.
     *
     * www.runforsafefood.org
     *
     * becomes:
     *
     * runforsafefood.org
     */
    const domain =
      hostname.replace(
        /^www\./,
        ""
      );

    /**
     * Store canonical root URL.
     *
     * Example:
     * https://runforsafefood.org
     */
    const normalizedUrl =
      `${parsedUrl.protocol}//${hostname}`;

    /**
     * Prevent the same user from
     * submitting the same domain twice.
     */
    const existingWebsite =
      await Website.findOne({
        userId:
          input.userId,

        domain,
      });

    if (existingWebsite) {
      throw new Error(
        "You have already submitted this website"
      );
    }

    /**
     * Generate public ID.
     */
    let websiteId =
      this.generateWebsiteId();

    /**
     * Extremely unlikely collision,
     * but check anyway.
     */
    while (
      await Website.exists({
        websiteId,
      })
    ) {
      websiteId =
        this.generateWebsiteId();
    }

    /**
     * Allowed domains.
     *
     * Store both root and www
     * versions for later widget
     * origin validation.
     */
    const allowedDomains = [
      domain,
      `www.${domain}`,
    ];

    /**
     * Create website.
     */
    const website =
      await Website.create({
        websiteId,

        userId:
          input.userId,

        name,

        url:
          normalizedUrl,

        domain,

        allowedDomains,

        /**
         * Admin must approve it.
         */
        status:
          "PENDING",

        /**
         * Script isn't installed yet.
         */
        widgetStatus:
          "NOT_INSTALLED",

        /**
         * Website hasn't been indexed.
         */
        indexingStatus:
          "NOT_INDEXED",

        /**
         * Chatbot remains inactive
         * until approval/setup.
         */
        isActive:
          false,
      });

    return website;
  }

  /**
   * Get all websites belonging
   * to the logged-in user.
   */
  async getUserWebsites(
    userId: string
  ) {
    const websites =
      await Website.find({
        userId,
      })
        .sort({
          createdAt: -1,
        })
        .select(
          "-__v"
        );

    return websites;
  }

  /**
   * Get one website.
   *
   * IMPORTANT:
   * We query by BOTH:
   *
   * _id
   * AND
   * userId
   *
   * This prevents User A from
   * accessing User B's website.
   */
  async getUserWebsiteById(
    websiteMongoId: string,
    userId: string
  ) {
    const website =
      await Website.findOne({
        _id:
          websiteMongoId,

        userId,
      }).select(
        "-__v"
      );

    if (!website) {
      throw new Error(
        "Website not found"
      );
    }

    return website;
  }

  /**
   * Delete a website submission.
   *
   * For the current MVP, deletion
   * is only allowed while PENDING
   * or REJECTED.
   *
   * An APPROVED website may already
   * have vectors in Qdrant, so deleting
   * it requires a proper cleanup flow.
   */
  async deleteWebsite(
    websiteMongoId: string,
    userId: string
  ) {
    const website =
      await Website.findOne({
        _id:
          websiteMongoId,

        userId,
      });

    if (!website) {
      throw new Error(
        "Website not found"
      );
    }

    if (
      website.status ===
      "APPROVED"
    ) {
      throw new Error(
        "Approved websites cannot be deleted directly"
      );
    }

    await website.deleteOne();

    return {
      id:
        websiteMongoId,
    };
  }
}

export default new WebsiteService();