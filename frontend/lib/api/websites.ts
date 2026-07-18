import { apiRequest } from "./http";
import type {
  Website,
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
};

/**
 * Type-narrow helper — IndexStatus.indexingStatus is the same union as
 * Website.indexingStatus so callers can use it directly.
 */
export type { IndexingStatus };