import type { ReactNode } from "react";

type Tone =
  | "neutral"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "muted";

interface BadgeProps {
  tone?: Tone;
  children: ReactNode;
  withDot?: boolean;
}

const toneStyles: Record<Tone, string> = {
  neutral: "bg-ink-100 text-ink-700",
  success: "bg-emerald-50 text-emerald-700",
  warning: "bg-amber-50 text-amber-700",
  danger: "bg-red-50 text-red-700",
  info: "bg-accent-50 text-accent-700",
  muted: "bg-white text-ink-500 border border-ink-200",
};

const dotColors: Record<Tone, string> = {
  neutral: "bg-ink-500",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-red-500",
  info: "bg-accent-500",
  muted: "bg-ink-300",
};

export function Badge({ tone = "neutral", withDot, children }: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium tracking-wide",
        toneStyles[tone],
      ].join(" ")}
    >
      {withDot && (
        <span
          className={["h-1.5 w-1.5 rounded-full", dotColors[tone]].join(" ")}
          aria-hidden
        />
      )}
      {children}
    </span>
  );
}

/**
 * Status-specific badge helpers — the only sanctioned way to render a status
 * across the app so colors stay consistent.
 */
import type {
  ApprovalStatus,
  IndexingStatus,
  WidgetStatus,
} from "@/types/website";
import type { AccountStatus } from "@/types/user";

export function ApprovalStatusBadge({ status }: { status: ApprovalStatus }) {
  const map: Record<ApprovalStatus, { label: string; tone: Tone }> = {
    PENDING: { label: "Pending", tone: "warning" },
    APPROVED: { label: "Approved", tone: "success" },
    REJECTED: { label: "Rejected", tone: "danger" },
  };
  const { label, tone } = map[status];
  return (
    <Badge tone={tone} withDot>
      {label}
    </Badge>
  );
}

export function WidgetStatusBadge({ status }: { status: WidgetStatus }) {
  const map: Record<WidgetStatus, { label: string; tone: Tone }> = {
    NOT_INSTALLED: { label: "Not installed", tone: "muted" },
    INSTALLED: { label: "Installed", tone: "success" },
  };
  const { label, tone } = map[status];
  return (
    <Badge tone={tone} withDot>
      {label}
    </Badge>
  );
}

export function IndexingStatusBadge({
  status,
}: {
  status: IndexingStatus;
}) {
  const map: Record<IndexingStatus, { label: string; tone: Tone }> = {
    NOT_INDEXED: { label: "Not indexed", tone: "muted" },
    INDEXING: { label: "Indexing", tone: "info" },
    INDEXED: { label: "Indexed", tone: "success" },
    FAILED: { label: "Failed", tone: "danger" },
  };
  const { label, tone } = map[status];
  return (
    <Badge tone={tone} withDot>
      {label}
    </Badge>
  );
}

export function AccountStatusBadge({ status }: { status: AccountStatus }) {
  const map: Record<AccountStatus, { label: string; tone: Tone }> = {
    ACTIVE: { label: "Active", tone: "success" },
    DISABLED: { label: "Disabled", tone: "muted" },
  };
  const { label, tone } = map[status];
  return <Badge tone={tone}>{label}</Badge>;
}
