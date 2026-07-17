import type { User } from "@/types/user";
import type { Website } from "@/types/website";

export const currentUser: User = {
  id: "user_1",
  name: "Alex Johnson",
  email: "alex@example.com",
  role: "USER",
  status: "ACTIVE",
  joinedAt: "2026-04-12T09:30:00Z",
};

export const currentAdmin: User = {
  id: "admin_1",
  name: "Priya Patel",
  email: "priya@scrappy.ai",
  role: "ADMIN",
  status: "ACTIVE",
  joinedAt: "2025-11-02T09:30:00Z",
};

export const users: User[] = [
  currentUser,
  {
    id: "user_2",
    name: "Marcus Lee",
    email: "marcus@indielabs.io",
    role: "USER",
    status: "ACTIVE",
    joinedAt: "2026-05-22T14:00:00Z",
  },
  {
    id: "user_3",
    name: "Sara Chen",
    email: "sara@brightpath.org",
    role: "USER",
    status: "ACTIVE",
    joinedAt: "2026-06-04T11:15:00Z",
  },
  {
    id: "user_4",
    name: "James Okafor",
    email: "james@quarry.dev",
    role: "USER",
    status: "DISABLED",
    joinedAt: "2026-02-18T08:00:00Z",
  },
  {
    id: "user_5",
    name: "Emily Rivera",
    email: "emily@thelantern.co",
    role: "USER",
    status: "ACTIVE",
    joinedAt: "2026-07-01T17:45:00Z",
  },
];

export const websites: Website[] = [
  {
    id: "1",
    websiteId: "ws_runforsafefood",
    userId: "user_1",
    name: "Run For Safe Food",
    url: "https://runforsafefood.org",
    domain: "runforsafefood.org",
    status: "APPROVED",
    widgetStatus: "INSTALLED",
    indexingStatus: "INDEXED",
    isActive: true,
    createdAt: "2026-04-20T10:00:00Z",
    approvedAt: "2026-04-22T15:30:00Z",
  },
  {
    id: "2",
    websiteId: "ws_quarry",
    userId: "user_4",
    name: "Quarry",
    url: "https://quarry.dev",
    domain: "quarry.dev",
    status: "APPROVED",
    widgetStatus: "INSTALLED",
    indexingStatus: "INDEXING",
    isActive: true,
    createdAt: "2026-02-25T12:00:00Z",
    approvedAt: "2026-02-27T09:00:00Z",
  },
  {
    id: "3",
    websiteId: "ws_brightpath",
    userId: "user_3",
    name: "Bright Path Foundation",
    url: "https://brightpath.org",
    domain: "brightpath.org",
    status: "PENDING",
    widgetStatus: "NOT_INSTALLED",
    indexingStatus: "NOT_INDEXED",
    isActive: false,
    createdAt: "2026-07-14T09:00:00Z",
  },
  {
    id: "4",
    websiteId: "ws_lantern",
    userId: "user_5",
    name: "The Lantern",
    url: "https://thelantern.co",
    domain: "thelantern.co",
    status: "REJECTED",
    widgetStatus: "NOT_INSTALLED",
    indexingStatus: "NOT_INDEXED",
    isActive: false,
    rejectionReason:
      "Domain does not resolve. Please verify the URL and resubmit.",
    createdAt: "2026-06-30T13:00:00Z",
  },
  {
    id: "5",
    websiteId: "ws_indielabs",
    userId: "user_2",
    name: "Indie Labs",
    url: "https://indielabs.io",
    domain: "indielabs.io",
    status: "APPROVED",
    widgetStatus: "INSTALLED",
    indexingStatus: "FAILED",
    isActive: true,
    createdAt: "2026-05-22T15:00:00Z",
    approvedAt: "2026-05-23T10:30:00Z",
  },
  {
    id: "6",
    websiteId: "ws_summit",
    userId: "user_1",
    name: "Summit Cycling",
    url: "https://summitcycling.com",
    domain: "summitcycling.com",
    status: "PENDING",
    widgetStatus: "NOT_INSTALLED",
    indexingStatus: "NOT_INDEXED",
    isActive: false,
    createdAt: "2026-07-16T16:00:00Z",
  },
];

/** Helper used by dashboard pages to scope to the signed-in user. */
export function getUserWebsites(userId: string): Website[] {
  return websites.filter((w) => w.userId === userId);
}

export function getWebsiteById(id: string): Website | undefined {
  return websites.find((w) => w.id === id);
}
