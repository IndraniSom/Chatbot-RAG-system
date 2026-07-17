export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";

export type WidgetStatus = "NOT_INSTALLED" | "INSTALLED";

export type IndexingStatus =
  | "NOT_INDEXED"
  | "INDEXING"
  | "INDEXED"
  | "FAILED";

export interface Website {
  id: string;
  websiteId: string; // public id used in the widget snippet (ws_abc123)
  userId: string;
  name: string;
  url: string;
  domain: string;
  status: ApprovalStatus;
  widgetStatus: WidgetStatus;
  indexingStatus: IndexingStatus;
  isActive: boolean;
  rejectionReason?: string;
  createdAt: string;
  approvedAt?: string;
}
