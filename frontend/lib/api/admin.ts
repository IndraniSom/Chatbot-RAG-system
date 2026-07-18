import { apiRequest } from "./http";
import type { Website, User } from "@/types";

export const adminApi = {
  getAllWebsites: () =>
    apiRequest<{ count: number; websites: Website[] }>({
      url: "/admin/websites",
      method: "GET",
    }),

  getPendingWebsites: () =>
    apiRequest<{ count: number; websites: Website[] }>({
      url: "/admin/websites/pending",
      method: "GET",
    }),

  approveWebsite: (id: string) =>
    apiRequest<{ website: Website }>({
      url: `/admin/websites/${id}/approve`,
      method: "PATCH",
    }),

  rejectWebsite: (id: string, reason: string) =>
    apiRequest<{ website: Website }>({
      url: `/admin/websites/${id}/reject`,
      method: "PATCH",
      data: { reason },
    }),

  getAllUsers: () =>
    apiRequest<{ count: number; users: User[] }>({
      url: "/admin/users",
      method: "GET",
    }),
};