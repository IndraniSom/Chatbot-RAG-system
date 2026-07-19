import { timingSafeEqual } from "crypto";

import { v2 as cloudinary } from "cloudinary";

let configured = false;
let configuredAt: number | null = null;

interface CloudinaryEnvSnapshot {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}

function readEnv(): CloudinaryEnvSnapshot | null {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim() ?? "";
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim() ?? "";
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim() ?? "";

  if (!cloudName || !apiKey || !apiSecret) return null;

  return { cloudName, apiKey, apiSecret };
}

function getBaseFolder(): string {
  const configuredFolder = process.env.CLOUDINARY_FOLDER?.trim();
  const folder = configuredFolder || "scrappy-widget-logos";
  return folder.replace(/^\/+|\/+$/g, "");
}

function ensureConfigured(): boolean {
  if (configured) return true;

  const snapshot = readEnv();
  if (!snapshot) return false;

  cloudinary.config({
    cloud_name: snapshot.cloudName,
    api_key: snapshot.apiKey,
    api_secret: snapshot.apiSecret,
    secure: true,
  });

  configured = true;
  configuredAt = Date.now();
  return true;
}

export function isCloudinaryConfigured(): boolean {
  return ensureConfigured();
}

export function resetCloudinaryConfig(): void {
  configured = false;
  configuredAt = null;
}

export function getCloudinaryStatus(): {
  configured: boolean;
  configuredAt: number | null;
} {
  return { configured, configuredAt };
}

export interface SignedUploadParams {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
  publicId: string;
}

function getWebsiteFolder(websiteId: string): string {
  return `${getBaseFolder()}/${websiteId}`;
}

export function buildSignedUploadParams(
  websiteId: string
): SignedUploadParams {
  const snapshot = readEnv();
  if (!snapshot || !ensureConfigured()) {
    throw new Error("Cloudinary is not configured on the server");
  }

  const folder = getWebsiteFolder(websiteId);
  const randomSuffix = globalThis.crypto
    .randomUUID()
    .replace(/-/g, "")
    .slice(0, 16);
  const publicId = `${websiteId}_${randomSuffix}`;
  const timestamp = Math.round(Date.now() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { folder, public_id: publicId, timestamp },
    snapshot.apiSecret
  );

  return {
    cloudName: snapshot.cloudName,
    apiKey: snapshot.apiKey,
    timestamp,
    signature,
    folder,
    publicId,
  };
}

/**
 * Rebuild the exact upload signature before trusting a completion request.
 * Returns the tenant-scoped Cloudinary public id used by the Admin API.
 */
export function verifySignedUploadCompletion(
  websiteId: string,
  publicId: string,
  timestamp: number,
  signature: string
): string {
  const snapshot = readEnv();
  if (!snapshot || !ensureConfigured()) {
    throw new Error("Cloudinary is not configured on the server");
  }

  const now = Math.round(Date.now() / 1000);
  if (!Number.isInteger(timestamp) || timestamp > now + 30 || now - timestamp > 10 * 60) {
    throw new Error("Upload signature has expired");
  }

  const escapedWebsiteId = websiteId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const publicIdPattern = new RegExp(`^${escapedWebsiteId}_[a-f0-9]{16}$`);
  if (!publicIdPattern.test(publicId)) {
    throw new Error("Upload public ID does not belong to this website");
  }

  const folder = getWebsiteFolder(websiteId);
  const expected = cloudinary.utils.api_sign_request(
    { folder, public_id: publicId, timestamp },
    snapshot.apiSecret
  );
  const expectedBuffer = Buffer.from(expected, "utf8");
  const suppliedBuffer = Buffer.from(signature, "utf8");

  if (
    expectedBuffer.length !== suppliedBuffer.length ||
    !timingSafeEqual(expectedBuffer, suppliedBuffer)
  ) {
    throw new Error("Upload signature is invalid");
  }

  return `${folder}/${publicId}`;
}

export async function verifyCloudinaryAsset(
  publicId: string
): Promise<{
  secureUrl: string;
  bytes: number;
  width: number;
  height: number;
  format: string;
}> {
  if (!ensureConfigured()) {
    throw new Error("Cloudinary is not configured on the server");
  }

  const result = await cloudinary.api.resource(publicId, {
    resource_type: "image",
    type: "upload",
  });

  return {
    secureUrl: String(result.secure_url ?? ""),
    bytes: Number(result.bytes ?? 0),
    width: Number(result.width ?? 0),
    height: Number(result.height ?? 0),
    format: String(result.format ?? "").toLowerCase(),
  };
}

export async function destroyCloudinaryAsset(publicId: string): Promise<void> {
  if (!publicId) return;
  if (!ensureConfigured()) {
    console.warn("[cloudinary] destroy skipped because it is not configured");
    return;
  }

  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
      type: "upload",
      invalidate: true,
    });
  } catch (error) {
    console.warn(
      "[cloudinary] destroy failed for %s: %s",
      publicId,
      error instanceof Error ? error.message : String(error)
    );
  }
}
