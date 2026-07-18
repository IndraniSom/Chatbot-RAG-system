/**
 * Domain types — match the backend's Mongoose models 1:1.
 *
 * Every type here reflects the snake_case / camelCase the API actually returns.
 * `_id` (Mongo) is normalized to `id` for use in React.
 */

export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";
export type WidgetStatus = "NOT_INSTALLED" | "INSTALLED";
export type IndexingStatus =
  | "NOT_INDEXED"
  | "INDEXING"
  | "INDEXED"
  | "FAILED";
export type UserRole = "USER" | "ADMIN";

/**
 * The backend user model stores `isActive: boolean` (not a status enum).
 * We expose `status: AccountStatus` in the frontend via the `getUserStatus`
 * helper so the UI never has to think about raw booleans.
 */
export type AccountStatus = "ACTIVE" | "DISABLED";

/**
 * When the backend populates `userId` / `approvedBy`, the field becomes a
 * tiny user object instead of a string. Used in admin responses.
 */
export interface PopulatedUserRef {
  _id: string;
  name: string;
  email: string;
}

export interface Website {
  /** Mongo _id, used for /api/websites/:id routes */
  id: string;
  /** Public id used in the widget snippet (ws_abc123) */
  websiteId: string;
  /**
   * String in customer-facing routes; populated object in admin routes.
   */
  userId: string | PopulatedUserRef;
  name: string;
  url: string;
  domain: string;
  status: ApprovalStatus;
  widgetStatus: WidgetStatus;
  indexingStatus: IndexingStatus;
  isActive: boolean;
  rejectionReason?: string;
  createdAt: string;
  updatedAt?: string;
  approvedAt?: string;
  approvedBy?: string | PopulatedUserRef;
  lastIndexedAt?: string | null;
  lastIndexingError?: string | null;
}

/**
 * Mirrors the backend's User model exactly:
 *  - `isActive: boolean` (the backend never returns `status`)
 *  - `createdAt: string`
 *
 * Note: there's no `AccountStatus` field on the wire. We derive a virtual
 * `status` from `isActive` only when rendering badges, via `getUserStatus`.
 */
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

/**
 * Helper for the badge — maps the backend's boolean `isActive` to the
 * frontend's AccountStatus enum.
 */
export function getUserStatus(user: User): AccountStatus {
  return user.isActive ? "ACTIVE" : "DISABLED";
}

/**
 * Narrow `Website.userId` into a populated user object. Returns undefined
 * when the field is still a plain string id (customer-facing routes).
 */
export function getWebsiteOwnerName(
  userId: Website["userId"]
): string | undefined {
  if (typeof userId === "string") return undefined;
  return userId?.name;
}

export function getWebsiteOwnerEmail(
  userId: Website["userId"]
): string | undefined {
  if (typeof userId === "string") return undefined;
  return userId?.email;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: AccountStatus;
  createdAt: string;
}

export interface InstallationInfo {
  websiteId: string;
  websiteName: string;
  url: string;
  domain: string;
  widgetStatus: WidgetStatus;
  script: string;
}

export interface InstallationVerification {
  installed: boolean;
  widgetStatus: WidgetStatus;
  websiteId?: string;
  message: string;
}

export interface IndexStatus {
  indexingStatus: IndexingStatus;
  progress: number; // 0-100
  lastIndexedAt: string | null;
  lastIndexingError: string | null;
}

export interface IndexJobAccepted {
  jobId?: string;
  status: IndexingStatus;
  message: string;
}