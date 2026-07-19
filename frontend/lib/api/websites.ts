import axios from "axios";
import { apiRequest } from "./http";
import type {
  Website,
  WebsiteAppearance,
  InstallationInfo,
  InstallationVerification,
  IndexStatus,
  IndexJobAccepted,
  IndexingStatus,
} from "@/types";

export const websitesApi = {
  list: () =>
    apiRequest<{ count: number; websites: Website[] }>({
      url: "/websites",
      method: "GET",
    }),

  get: (id: string) =>
    apiRequest<{ website: Website }>({
      url: `/websites/${id}`,
      method: "GET",
    }),

  create: (payload: { name: string; url: string }) =>
    apiRequest<{ website: Website }>({
      url: "/websites",
      method: "POST",
      data: payload,
    }),

  delete: (id: string) =>
    apiRequest<{ success: true }>({
      url: `/websites/${id}`,
      method: "DELETE",
    }),

  // ---- installation ----

  getInstallation: (id: string) =>
    apiRequest<{ installation: InstallationInfo }>({
      url: `/websites/${id}/installation`,
      method: "GET",
    }),

  verifyInstallation: (id: string) =>
    apiRequest<InstallationVerification>({
      url: `/websites/${id}/verify-installation`,
      method: "POST",
    }),

  // ---- indexing ----

  /**
   * POST /api/websites/:id/index — body: { maxPages }
   * Backend returns the indexed website record (201 Accepted semantics).
   */
  startIndex: (id: string, maxPages = 20) =>
    apiRequest<IndexJobAccepted>({
      url: `/websites/${id}/index`,
      method: "POST",
      data: { maxPages },
    }),

  getIndexStatus: (id: string) =>
    apiRequest<IndexStatus>({
      url: `/websites/${id}/index-status`,
      method: "GET",
    }),

  cancelIndex: (id: string) =>
    apiRequest<{ success: true; message: string }>({
      url: `/websites/${id}/index-job`,
      method: "DELETE",
    }),

  // ---- appearance ----

  /**
   * PATCH /api/websites/:id/appearance
   * Body: { primaryColor, surfaceColor }
   * Returns the updated website so the dashboard can keep its local copy in sync.
   */
  updateAppearance: (
    id: string,
    payload: { primaryColor: string; surfaceColor: string }
  ) =>
    apiRequest<{ appearance: WebsiteAppearance }>({
      url: `/websites/${id}/appearance`,
      method: "PATCH",
      data: payload,
    }),

  /**
   * POST /api/websites/:id/logo/signature
   * Body: { folder?, publicId?, overwrite? }
   * Returns the signed Cloudinary params the browser needs to upload directly.
   * The backend wraps them in `{ params: { cloudName, apiKey, timestamp, signature, folder, publicId } }`.
   *
   * No JWT is sent in the browser-to-Cloudinary leg — only the returned
   * signature + the public api key. We expose `params.cloudName` so the
   * uploader can build the upload URL itself.
   */
  getLogoSignature: (
    id: string,
    payload?: { folder?: string; publicId?: string; overwrite?: boolean }
  ) =>
    apiRequest<{
      params: {
        cloudName: string;
        apiKey: string;
        timestamp: number;
        signature: string;
        folder: string;
        publicId: string;
      };
    }>({
      url: `/websites/${id}/logo/signature`,
      method: "POST",
      data: payload ?? {},
    }),

  /**
   * POST /api/websites/:id/logo/complete
   * Body: { publicId, timestamp, signature }
   *
   * `publicId` here is the *unqualified* generated id from the signature
   * response (NOT Cloudinary's full path) — the backend appends its
   * derived/owned folder. `timestamp` + `signature` are the same values
   * we used for the direct Cloudinary upload; the backend verifies them.
   */
  completeLogoUpload: (
    id: string,
    payload: { publicId: string; timestamp: number; signature: string }
  ) =>
    apiRequest<{ appearance: WebsiteAppearance }>({
      url: `/websites/${id}/logo/complete`,
      method: "POST",
      data: payload,
    }),

  /**
   * DELETE /api/websites/:id/logo
   * Asks the backend to remove the logo (and Cloudinary asset) for this website.
   */
  deleteLogo: (id: string) =>
    apiRequest<{ appearance: WebsiteAppearance }>({
      url: `/websites/${id}/logo`,
      method: "DELETE",
    }),
};

/**
 * Public widget config envelope — what the on-page widget bootstraps from.
 * Defined here so consumers can shape their types off the same source.
 *
 * The widget fetches this without auth, then renders against it. The
 * dashboard never consumes this directly (it already has the Website
 * record) but the type is documented for completeness.
 */
export interface WidgetConfig {
  websiteId: string;
  primaryColor: string;
  surfaceColor: string;
  logoUrl?: string;
}

/**
 * Direct browser-to-Cloudinary upload helper.
 *
 * Cloudinary's upload FormData must include `folder`, `public_id`,
 * `timestamp`, `api_key`, and `signature` — these come straight from the
 * backend's signature response. We never send the JWT to Cloudinary.
 *
 * The caller (AppearanceEditor) wires `onUploadProgress` to drive a
 * progress bar; we use axios (XMLHttpRequest under the hood) so progress
 * events are available — fetch can't stream upload progress.
 *
 * Returns void: the backend `/logo/complete` call resolves the secure URL
 * and persists it on the website record, so we don't need to forward
 * Cloudinary's response to anyone.
 */
export async function uploadLogoToCloudinary(args: {
  file: File;
  cloudName: string;
  apiKey: string;
  signature: string;
  timestamp: number;
  folder: string;
  publicId: string;
  onUploadProgress?: (percent: number) => void;
}): Promise<void> {
  const uploadUrl = `https://api.cloudinary.com/v1_1/${args.cloudName}/image/upload`;
  const form = new FormData();
  form.append("file", args.file);
  form.append("api_key", args.apiKey);
  form.append("timestamp", String(args.timestamp));
  form.append("signature", args.signature);
  form.append("folder", args.folder);
  form.append("public_id", args.publicId);
  await axios.post(uploadUrl, form, {
    // Let the browser set the multipart boundary — don't override Content-Type.
    onUploadProgress: (evt) => {
      if (!args.onUploadProgress) return;
      if (evt.total && evt.total > 0) {
        const pct = Math.round((evt.loaded / evt.total) * 100);
        args.onUploadProgress(pct);
      } else if (evt.loaded) {
        // We don't know the total — show an indeterminate "uploading…" state.
        args.onUploadProgress(-1);
      }
    },
  });
}

/**
 * Type-narrow helper — IndexStatus.indexingStatus is the same union as
 * Website.indexingStatus so callers can use it directly.
 */
export type { IndexingStatus, WebsiteAppearance };