"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Globe,
  AlertCircle,
  Clock,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import {
  ApprovalStatusBadge,
  IndexingStatusBadge,
  WidgetStatusBadge,
} from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ScriptCodeBlock } from "@/components/dashboard/ScriptCodeBlock";
import { WebsiteDetailActions } from "@/components/dashboard/WebsiteDetailActions";
import { IndexStatusPanel } from "@/components/dashboard/IndexStatusPanel";
import { ErrorState, LoadingState } from "@/components/ui/Feedback";
import { ApiError, websitesApi } from "@/lib/api";
import { getWebsiteId, type Website, type WidgetStatus, type IndexingStatus } from "@/types";
import { formatDateTime } from "@/lib/format";

export default function WebsiteDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id ?? "";

  const [website, setWebsite] = useState<Website | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWebsite = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const { website } = await websitesApi.get(id);
      setWebsite(website);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.serverMessage ?? err.message
          : "Could not load website.";
      // 404 → notFound(); everything else → inline error.
      if (err instanceof ApiError && err.status === 404) {
        router.replace("/dashboard/websites");
        return;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    void fetchWebsite();
  }, [fetchWebsite]);

  const onDelete = async () => {
    if (!website) return;
    if (website.status === "APPROVED") {
      toast.error("Approved websites cannot be deleted.");
      return;
    }
    if (!window.confirm("Delete this website? This cannot be undone.")) {
      return;
    }
    try {
      await websitesApi.delete(getWebsiteId(website));
      toast.success("Website deleted.");
      router.push("/dashboard/websites");
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.serverMessage ?? err.message
          : "Could not delete website.";
      toast.error(message);
    }
  };

  if (loading) {
    return (
      <>
        <Header title="Loading…" />
        <LoadingState label="Loading website…" />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header title="Website" />
        <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
          <ErrorState message={error} onRetry={fetchWebsite} />
        </div>
      </>
    );
  }

  if (!website) return null;

  return (
    <WebsiteDetailBody
      website={website}
      onLocalUpdate={(updater) =>
        setWebsite((prev) => (prev ? updater(prev) : prev))
      }
      onDelete={onDelete}
    />
  );
}

function WebsiteDetailBody({
  website,
  onLocalUpdate,
  onDelete,
}: {
  website: Website;
  onLocalUpdate: (updater: (prev: Website) => Website) => void;
  onDelete: () => void;
}) {
  const [installation, setInstallation] = useState<{
    script: string;
    widgetStatus: WidgetStatus;
  } | null>(null);
  const [installationError, setInstallationError] = useState<string | null>(
    null
  );

  // Fetch installation script when approved.
  useEffect(() => {
    if (website.status !== "APPROVED") return;
    let cancelled = false;
    (async () => {
      try {
        const { installation } = await websitesApi.getInstallation(getWebsiteId(website));
        if (!cancelled) {
          setInstallation({
            script: installation.script,
            widgetStatus: installation.widgetStatus,
          });
        }
      } catch (err) {
        if (cancelled) return;
        const message =
          err instanceof ApiError
            ? err.serverMessage ?? err.message
            : "Could not load installation script.";
        setInstallationError(message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [getWebsiteId(website), website.status]);

  const onIndexingChange = (s: IndexingStatus) =>
    onLocalUpdate((prev) => ({ ...prev, indexingStatus: s }));

  const onWidgetStatusChange = (s: WidgetStatus) =>
    onLocalUpdate((prev) => ({ ...prev, widgetStatus: s }));

  return (
    <>
      <Header
        title={website.name}
        description={website.url}
        actions={
          website.status !== "APPROVED" ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              leftIcon={<Trash2 size={14} />}
            >
              Delete
            </Button>
          ) : null
        }
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
            value={
              <IndexStatusPanel
                websiteId={getWebsiteId(website)}
                websiteStatus={website.status}
                initialStatus={website.indexingStatus}
                initialLastIndexedAt={website.lastIndexedAt ?? null}
                onIndexingChange={onIndexingChange}
              />
            }
            caption={null}
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
              {installation ? (
                <ScriptCodeBlock code={installation.script} />
              ) : installationError ? (
                <p className="text-[12.5px] text-red-600">{installationError}</p>
              ) : (
                <LoadingState label="Loading script…" />
              )}
            </div>

            {installation && (
              <div className="mt-5">
                <WebsiteDetailActions
                  websiteId={getWebsiteId(website)}
                  widgetInstalled={installation.widgetStatus === "INSTALLED"}
                  onWidgetStatusChange={onWidgetStatusChange}
                />
              </div>
            )}

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
  caption: string | null;
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
      {caption && <p className="mt-2 text-[12px] text-ink-500">{caption}</p>}
    </Card>
  );
}