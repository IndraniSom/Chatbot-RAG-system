import Website from "../../models/website";
import User from "../../models/user";

class AdminService {
  /**
   * Get all websites.
   *
   * Admin only.
   */
  async getAllWebsites() {
    const websites =
      await Website.find()
        .populate(
          "userId",
          "name email"
        )
        .populate(
          "approvedBy",
          "name email"
        )
        .sort({
          createdAt: -1,
        })
        .select("-__v");

    return websites;
  }

  /**
   * Get all websites waiting
   * for admin approval.
   */
  async getPendingWebsites() {
    const websites =
      await Website.find({
        status: "PENDING",
      })
        .populate(
          "userId",
          "name email"
        )
        .sort({
          createdAt: -1,
        })
        .select("-__v");

    return websites;
  }

  /**
   * Approve website.
   */
  async approveWebsite(
    websiteId: string,
    adminId: string
  ) {
    const website =
      await Website.findById(
        websiteId
      );

    if (!website) {
      throw new Error(
        "Website not found"
      );
    }

    /**
     * Only pending websites
     * should be approved.
     */
    if (
      website.status !==
      "PENDING"
    ) {
      throw new Error(
        `Website is already ${website.status.toLowerCase()}`
      );
    }

    /**
     * Approve website.
     */
    website.status =
      "APPROVED";

    website.approvedBy =
      adminId as any;

    website.approvedAt =
      new Date();

    /**
     * IMPORTANT:
     *
     * Don't activate chatbot yet.
     *
     * Activation happens after:
     *
     * 1. Script installed
     * 2. Installation verified
     * 3. Website indexed
     */
    website.isActive =
      false;

    /**
     * Remove old rejection
     * reason if applicable.
     */
    website.rejectionReason =
      undefined;

    await website.save();

    return website;
  }

  /**
   * Reject website.
   */
  async rejectWebsite(
    websiteId: string,
    adminId: string,
    reason: string
  ) {
    const website =
      await Website.findById(
        websiteId
      );

    if (!website) {
      throw new Error(
        "Website not found"
      );
    }

    if (
      website.status !==
      "PENDING"
    ) {
      throw new Error(
        `Website is already ${website.status.toLowerCase()}`
      );
    }

    const rejectionReason =
      reason.trim();

    if (!rejectionReason) {
      throw new Error(
        "Rejection reason is required"
      );
    }

    website.status =
      "REJECTED";

    website.rejectionReason =
      rejectionReason;

    /**
     * Rejected websites must
     * never have an active chatbot.
     */
    website.isActive =
      false;

    /**
     * Since it was not approved,
     * clear approval metadata.
     */
    website.approvedBy =
      undefined;

    website.approvedAt =
      undefined;

    await website.save();

    return website;
  }

  /**
   * Get all users.
   *
   * Useful for admin dashboard.
   */
  async getAllUsers() {
    const users =
      await User.find()
        .select(
          "-passwordHash -__v"
        )
        .sort({
          createdAt: -1,
        });

    return users;
  }
}

export default new AdminService();