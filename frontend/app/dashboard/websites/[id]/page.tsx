import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Globe,
  AlertCircle,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import {
  ApprovalStatusBadge,
  IndexingStatusBadge,
  WidgetStatusBadge,
} from "@/components/ui/Badge";
import { ScriptCodeBlock } from "@/components/dashboard/ScriptCodeBlock";
import { WebsiteDetailActions } from "@/components/dashboard/WebsiteDetailActions";
import { currentUser, getWebsiteById } from "@/lib/mock-data";
import { formatDateTime } from "@/lib/format";

interface PageProps {
  params: { id: string };
}

export default function WebsiteDetailPage({ params }: PageProps) {
  const website = getWebsiteById(params.id);
  if (!website) notFound();
  // Soft access guard: in real life, check ownership here.
  if (website.userId !== currentUser.id) notFound();

  const script = `<script\n  src="https://widget.scrappy.ai/widget.js"\n  data-website-id="${website.websiteId}"\n></script>`;

  return (
    <>
      <Header
        title={website.name}
        description={website.url}
        user={currentUser}
      />
      <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/dashboard/websites"
          className="inline-flex items-center gap-1 text-[12.5px] font-medium text-ink-500 hover:text-ink-900"
        >
          <ArrowLeft size={13} strokeWidth={2.4} />
          Back to websites
        </Link>

        {/* Hero card */}
        <Card>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-ink-50 text-ink-700"
                aria-hidden
              >
                <Globe size={18} />
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-[18px] font-semibold tracking-tight text-ink-900">
                  {website.name}
                </h2>
                <p className="mt-0.5 truncate text-[13px] text-ink-500">
                  {website.url}
                </p>
                <p className="mt-1 text-[11.5px] text-ink-400">
                  Submitted {formatDateTime(website.createdAt)}
                </p>
              </div>
            </div>
            <ApprovalStatusBadge status={website.status} />
          </div>
        </Card>

        {/* Status row */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatusTile
            label="Approval Status"
            icon={<CheckCircle2 size={14} />}
            value={<ApprovalStatusBadge status={website.status} />}
            caption={
              website.status === "APPROVED" && website.approvedAt
                ? `Approved ${formatDateTime(website.approvedAt)}`
                : website.status === "PENDING"
                ? "Awaiting admin review"
                : "Submission rejected"
            }
          />
          <StatusTile
            label="Widget Installation"
            icon={<Globe size={14} />}
            value={<WidgetStatusBadge status={website.widgetStatus} />}
            caption={
              website.widgetStatus === "INSTALLED"
                ? "Live on your website"
                : "Paste the script into your site"
            }
          />
          <StatusTile
            label="Knowledge Indexing"
            icon={<Clock size={14} />}
            value={<IndexingStatusBadge status={website.indexingStatus} />}
            caption={
              website.indexingStatus === "INDEXED"
                ? "Your chatbot is ready to answer"
                : website.indexingStatus === "INDEXING"
                ? "Indexing in progress"
                : website.indexingStatus === "FAILED"
                ? "Reindex to try again"
                : "Index after installing the widget"
            }
          />
        </div>

        {/* Pending notice */}
        {website.status === "PENDING" && (
          <Card className="border-amber-200 bg-amber-50/60">
            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 text-amber-700" size={16} />
              <div>
                <p className="text-[13.5px] font-semibold text-amber-800">
                  Your website is waiting for admin approval.
                </p>
                <p className="mt-1 text-[12.5px] text-amber-700/90">
                  We'll review your submission within one business day. You
                  won't be able to install the widget until your website is
                  approved.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Rejection notice */}
        {website.status === "REJECTED" && (
          <Card className="border-red-200 bg-red-50/60">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 text-red-700" size={16} />
              <div>
                <p className="text-[13.5px] font-semibold text-red-800">
                  Submission rejected
                </p>
                <p className="mt-1 text-[12.5px] text-red-700/90">
                  {website.rejectionReason ??
                    "Please contact support for more information."}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Approved — installation */}
        {website.status === "APPROVED" && (
          <Card>
            <div className="flex flex-col gap-1">
              <h3 className="text-[15px] font-semibold text-ink-900">
                Install Scrappy
              </h3>
              <p className="text-[13px] text-ink-500">
                Copy this script and paste it before the closing{" "}
                <code className="rounded bg-ink-50 px-1.5 py-0.5 text-[12px] text-ink-700">
                  &lt;/body&gt;
                </code>{" "}
                tag of your website.
              </p>
            </div>
            <div className="mt-4">
              <ScriptCodeBlock code={script} />
            </div>
            <div className="mt-5">
              <WebsiteDetailActions
                widgetInstalled={website.widgetStatus === "INSTALLED"}
                indexingStatus={website.indexingStatus}
              />
            </div>

            {website.widgetStatus === "INSTALLED" && (
              <div className="mt-5 flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5">
                <CheckCircle2
                  className="mt-0.5 text-emerald-600"
                  size={16}
                  strokeWidth={2.4}
                />
                <p className="text-[13px] font-medium text-emerald-700">
                  Scrappy is successfully connected to your website.
                </p>
              </div>
            )}
          </Card>
        )}
      </div>
    </>
  );
}

function StatusTile({
  label,
  icon,
  value,
  caption,
}: {
  label: string;
  icon: React.ReactNode;
  value: React.ReactNode;
  caption: string;
}) {
  return (
    <Card>
      <div className="flex items-center gap-2 text-ink-500">
        {icon}
        <p className="text-[12px] font-medium uppercase tracking-wider">
          {label}
        </p>
      </div>
      <div className="mt-3">{value}</div>
      <p className="mt-2 text-[12px] text-ink-500">{caption}</p>
    </Card>
  );
}
