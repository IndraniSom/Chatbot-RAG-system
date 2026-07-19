import Website, {
  DEFAULT_APPEARANCE,
  type IWebsiteAppearance,
} from "../../models/website";

import {
  destroyCloudinaryAsset,
  verifyCloudinaryAsset,
  verifySignedUploadCompletion,
} from "../../config/cloudinary";

import {
  ALLOWED_APPEARANCE_FIELDS,
  ALLOWED_LOGO_FORMATS,
  MAX_LOGO_BYTES,
  MAX_LOGO_DIMENSION,
  MIN_LOGO_DIMENSION,
  isValidHexColor,
  normalizeHexColor,
} from "./appearance.constants";

/**
 * Sentinel thrown when an unknown key is supplied to the PATCH endpoint.
 * The controller maps this to a 400 with a helpful message.
 */
export class AppearanceValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AppearanceValidationError";
  }
}

/**
 * Sentinel thrown when the logo uploaded to Cloudinary doesn't meet our
 * constraints. Carries a copy-friendly message for the dashboard.
 */
export class LogoRejectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LogoRejectionError";
  }
}

/**
 * Thrown when an upload attempt references a website the caller doesn't
 * own. Maps to 404 (not 403) so we don't disclose ownership.
 */
class AppearanceNotFoundError extends Error {
  constructor() {
    super("Website not found");
    this.name = "AppearanceNotFoundError";
  }
}

interface FindOwnedWebsiteOptions {
  /** When true we project appearance; when false we fetch the full doc. */
  withAppearance?: boolean;
}

/**
 * Internal helper: fetch a website and assert that `userId` owns it.
 *
 * The shape (ObjectId or appearance subset) is unimportant — we just
 * need the result to flow into the next mutation.
 */
async function findOwnedWebsite(
  websiteMongoId: string,
  userId: string,
  options: FindOwnedWebsiteOptions = {}
) {
  const projection = options.withAppearance
    ? undefined
    : "appearance websiteId userId";

  const website = projection
    ? await Website.findOne(
        { _id: websiteMongoId, userId },
        projection
      )
    : await Website.findOne({
        _id: websiteMongoId,
        userId,
      });

  if (!website) {
    throw new AppearanceNotFoundError();
  }

  return website;
}

/**
 * Lookup a website by id only — used internally for completion (where
 * we already verified ownership via the path parameter + JWT) and
 * removal where we don't yet need to know who owns it.
 */
async function findWebsiteById(
  websiteMongoId: string,
  userId: string
) {
  const website = await Website.findOne({
    _id: websiteMongoId,
    userId,
  });

  if (!website) {
    throw new AppearanceNotFoundError();
  }

  return website;
}

/**
 * Public surface of the appearance service. The controller is allowed
 * to use just these methods.
 */
class AppearanceService {
  /**
   * Read the current appearance for an owned website.
   *
   * Always returns a fully-populated object (with defaults applied) so
   * the dashboard can mount with sane values even on legacy documents.
   */
  async getAppearance(
    websiteMongoId: string,
    userId: string
  ): Promise<IWebsiteAppearance> {
    const website = await findOwnedWebsite(
      websiteMongoId,
      userId,
      { withAppearance: true }
    );

    return this.normalizeAppearance(website.appearance);
  }

  /**
   * Apply a partial update to the appearance subdocument.
   *
   * Strict validation:
   *  - keys must be in `ALLOWED_APPEARANCE_FIELDS`
   *  - colors must be hex
   *  - logo flag must be a boolean when present
   *
   * `removeLogo: true` clears the existing logo and (best-effort)
   * destroys the underlying Cloudinary asset after the DB write
   * commits.
   *
   * Returns the up-to-date appearance so the controller can echo it
   * back without a second round-trip.
   */
  async updateAppearance(
    websiteMongoId: string,
    userId: string,
    payload: unknown
  ): Promise<IWebsiteAppearance> {
    if (
      typeof payload !== "object" ||
      payload === null ||
      Array.isArray(payload)
    ) {
      throw new AppearanceValidationError(
        "Appearance update payload must be a JSON object"
      );
    }

    const body = payload as Record<string, unknown>;

    for (const key of Object.keys(body)) {
      if (!ALLOWED_APPEARANCE_FIELDS.has(key)) {
        throw new AppearanceValidationError(
          `Field "${key}" is not allowed on appearance`
        );
      }
    }

    if (
      Object.prototype.hasOwnProperty.call(
        body,
        "primaryColor"
      )
    ) {
      if (!isValidHexColor(body.primaryColor)) {
        throw new AppearanceValidationError(
          "primaryColor must be a hex color like #2563eb"
        );
      }
    }

    if (
      Object.prototype.hasOwnProperty.call(
        body,
        "surfaceColor"
      )
    ) {
      if (!isValidHexColor(body.surfaceColor)) {
        throw new AppearanceValidationError(
          "surfaceColor must be a hex color like #ffffff"
        );
      }
    }

    if (
      Object.prototype.hasOwnProperty.call(body, "removeLogo")
    ) {
      if (typeof body.removeLogo !== "boolean") {
        throw new AppearanceValidationError(
          "removeLogo must be a boolean"
        );
      }
    }

    const website = await findWebsiteById(
      websiteMongoId,
      userId
    );

    const appearance = website.appearance ?? {
      primaryColor: DEFAULT_APPEARANCE.primaryColor,
      surfaceColor: DEFAULT_APPEARANCE.surfaceColor,
    };

    let previousLogoPublicId: string | undefined;

    if (
      Object.prototype.hasOwnProperty.call(
        body,
        "primaryColor"
      )
    ) {
      appearance.primaryColor = normalizeHexColor(
        body.primaryColor as string
      );
    }

    if (
      Object.prototype.hasOwnProperty.call(
        body,
        "surfaceColor"
      )
    ) {
      appearance.surfaceColor = normalizeHexColor(
        body.surfaceColor as string
      );
    }

    if (body.removeLogo === true) {
      previousLogoPublicId =
        appearance.logoPublicId ?? undefined;
      appearance.logoUrl = undefined;
      appearance.logoPublicId = undefined;
    }

    website.appearance = appearance;
    website.markModified("appearance");
    await website.save();

    /**
     * Best-effort destroy of the prior logo. Do this *after* the DB
     * write so a Cloudinary outage doesn't lose the URL reference in
     * our DB; the next re-upload (or a manual janitor pass) will
     * recover.
     */
    if (previousLogoPublicId) {
      await destroyCloudinaryAsset(previousLogoPublicId);
    }

    return this.normalizeAppearance(website.appearance);
  }

  /**
   * Confirm a browser-direct upload completed and persist its URL.
   *
   * Steps:
   *   1. Reject unknown fields in payload (we never trust the
   *      client-provided URL/metadata, only the publicId).
   *   2. Reject logos that don't satisfy format/byte/dimension rules.
   *   3. Query Cloudinary for the authoritative asset info.
   *   4. Save the optimized secure_url + publicId on the DB.
   *   5. Best-effort destroy the previously persisted logo (after DB
   *      success) and the freshly uploaded asset (if it failed
   *      validation).
   *
   * Returns the updated appearance.
   */
  async completeLogoUpload(
    websiteMongoId: string,
    userId: string,
    payload: unknown
  ): Promise<IWebsiteAppearance> {
    if (
      typeof payload !== "object" ||
      payload === null ||
      Array.isArray(payload)
    ) {
      throw new AppearanceValidationError(
        "Upload completion payload must be a JSON object"
      );
    }

    const body = payload as Record<string, unknown>;
    const allowedFields = new Set(["publicId", "timestamp", "signature"]);
    const unknownField = Object.keys(body).find(
      (key) => !allowedFields.has(key)
    );

    if (unknownField) {
      throw new AppearanceValidationError(
        `Field "${unknownField}" is not allowed when completing an upload`
      );
    }

    const publicIdRaw = body.publicId;
    const timestampRaw = body.timestamp;
    const signatureRaw = body.signature;

    if (
      typeof publicIdRaw !== "string" ||
      !publicIdRaw.trim() ||
      typeof timestampRaw !== "number" ||
      typeof signatureRaw !== "string" ||
      !signatureRaw.trim()
    ) {
      throw new AppearanceValidationError(
        "publicId, timestamp, and signature are required to complete an upload"
      );
    }

    const website = await findWebsiteById(
      websiteMongoId,
      userId
    );

    let publicId: string;
    try {
      publicId = verifySignedUploadCompletion(
        website.websiteId,
        publicIdRaw.trim(),
        timestampRaw,
        signatureRaw.trim()
      );
    } catch (error) {
      throw new AppearanceValidationError(
        error instanceof Error ? error.message : "Upload signature is invalid"
      );
    }

    /** Query Cloudinary for authoritative asset metadata. */
    let verified;
    try {
      verified = await verifyCloudinaryAsset(publicId);
    } catch (error) {
      const msg =
        error instanceof Error
          ? error.message
          : "asset not found";
      throw new LogoRejectionError(
        `Upload verification failed: ${msg}`
      );
    }

    if (!ALLOWED_LOGO_FORMATS.has(verified.format)) {
      await this.cleanupRejectedAsset(publicId);
      throw new LogoRejectionError(
        `Logo format "${verified.format}" is not supported. Use PNG, JPG, or WEBP.`
      );
    }

    if (verified.bytes > MAX_LOGO_BYTES) {
      await this.cleanupRejectedAsset(publicId);
      throw new LogoRejectionError(
        "Logo file is larger than 2 MB"
      );
    }

    if (
      verified.width > MAX_LOGO_DIMENSION ||
      verified.height > MAX_LOGO_DIMENSION
    ) {
      await this.cleanupRejectedAsset(publicId);
      throw new LogoRejectionError(
        `Logo dimensions must be at most ${MAX_LOGO_DIMENSION}px on each side`
      );
    }

    if (
      verified.width < MIN_LOGO_DIMENSION ||
      verified.height < MIN_LOGO_DIMENSION
    ) {
      await this.cleanupRejectedAsset(publicId);
      throw new LogoRejectionError(
        `Logo dimensions must be at least ${MIN_LOGO_DIMENSION}px on each side`
      );
    }

    const appearance = website.appearance ?? {
      primaryColor: DEFAULT_APPEARANCE.primaryColor,
      surfaceColor: DEFAULT_APPEARANCE.surfaceColor,
    };

    const previousLogoPublicId =
      appearance.logoPublicId ?? undefined;

    appearance.logoUrl = verified.secureUrl;
    appearance.logoPublicId = publicId;

    website.appearance = appearance;
    website.markModified("appearance");
    await website.save();

    /**
     * Replace the previously-stored logo *after* the DB save so a
     * Cloudinary hiccup doesn't lose the DB reference.
     */
    if (
      previousLogoPublicId &&
      previousLogoPublicId !== publicId
    ) {
      await destroyCloudinaryAsset(previousLogoPublicId);
    }

    return this.normalizeAppearance(website.appearance);
  }

  /**
   * Best-effort cleanup used when a freshly-uploaded asset fails our
   * validation. We don't surface failures — the dashboard already has
   * an error to render and Cloudinary storage quotas aren't a customer
   * concern.
   */
  private async cleanupRejectedAsset(
    publicId: string
  ): Promise<void> {
    try {
      await destroyCloudinaryAsset(publicId);
    } catch {
      // Already swallowed inside destroyCloudinaryAsset.
    }
  }

  /**
   * Normalize the persisted appearance shape for API responses.
   *
   * The persisted subdoc might be missing on legacy documents read
   * before Mongoose has had a chance to apply defaults (e.g. raw
   * `findOne(...).lean()` queries). This helper guarantees the
   * controller never sees `undefined` for a color.
   */
  private normalizeAppearance(
    raw: IWebsiteAppearance | undefined
  ): IWebsiteAppearance {
    return {
      primaryColor:
        raw?.primaryColor ??
        DEFAULT_APPEARANCE.primaryColor,
      surfaceColor:
        raw?.surfaceColor ??
        DEFAULT_APPEARANCE.surfaceColor,
      logoUrl: raw?.logoUrl,
      logoPublicId: raw?.logoPublicId,
    };
  }
}

export default new AppearanceService();
