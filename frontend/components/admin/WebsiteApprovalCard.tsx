"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { ExternalLink, X, Check } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import type { Website } from "@/types";
import { ApiError, adminApi } from "@/lib/api";
import { formatDate } from "@/lib/format";

interface WebsiteApprovalCardProps {
  website: Website;
  /** Notified when approve / reject succeeds so the parent can refetch. */
  onResolved?: (next: Website) => void;
  onRemove?: (id: string) => void;
}

export function WebsiteApprovalCard({
  website,
  onResolved,
  onRemove,
}: WebsiteApprovalCardProps) {
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  // Pull owner name/email from the populated userId (admin endpoints).
  const owner =
    typeof website.userId === "string" ? null : website.userId;

  const onApprove = async () => {
    setBusy(true);
    try {
      const { website: updated } = await adminApi.approveWebsite(website.id);
      toast.success(`${updated.name} approved.`);
      setApproveOpen(false);
      onResolved?.(updated);
      onRemove?.(website.id);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.serverMessage ?? err.message
          : "Could not approve website.";
      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  const onReject = async () => {
    if (!reason.trim()) return;
    setBusy(true);
    try {
      const { website: updated } = await adminApi.rejectWebsite(
        website.id,
        reason.trim()
      );
      toast.success(`${updated.name} rejected.`);
      setRejectOpen(false);
      onResolved?.(updated);
      onRemove?.(website.id);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.serverMessage ?? err.message
          : "Could not reject website.";
      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Card>
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <h3 className="text-[15px] font-semibold text-ink-900">
              {website.name}
            </h3>
            <p className="mt-0.5 truncate text-[12.5px] text-ink-500">
              {website.url}
            </p>
            <dl className="mt-3 grid grid-cols-1 gap-2 text-[12.5px] sm:grid-cols-3">
              <div>
                <dt className="text-ink-400">Customer</dt>
                <dd className="font-medium text-ink-700">
                  {owner?.name ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="text-ink-400">Email</dt>
                <dd className="truncate font-medium text-ink-700">
                  {owner?.email ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="text-ink-400">Submitted</dt>
                <dd className="font-medium text-ink-700">
                  {formatDate(website.createdAt)}
                </dd>
              </div>
            </dl>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <a
              href={website.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center"
            >
              <Button variant="secondary" size="sm">
                <ExternalLink size={13} strokeWidth={2.2} className="mr-1.5" />
                Visit Website
              </Button>
            </a>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setRejectOpen(true)}
            >
              <X size={13} strokeWidth={2.4} className="mr-1.5" />
              Reject
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setApproveOpen(true)}
            >
              <Check size={13} strokeWidth={2.6} className="mr-1.5" />
              Approve
            </Button>
          </div>
        </div>
      </Card>

      {/* Approve confirmation */}
      <Modal
        open={approveOpen}
        onClose={() => !busy && setApproveOpen(false)}
        title="Approve website"
        description={`Approve ${website.name} and let the customer install Scrappy?`}
        size="sm"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setApproveOpen(false)}
              disabled={busy}
            >
              Cancel
            </Button>
            <Button onClick={onApprove} loading={busy}>
              Approve Website
            </Button>
          </>
        }
      >
        <p className="text-[13px] text-ink-500">
          Once approved, the customer will see the installation script on their
          website page and can paste it before their closing{" "}
          <code className="rounded bg-ink-50 px-1.5 py-0.5 text-[12px] text-ink-700">
            &lt;/body&gt;
          </code>{" "}
          tag.
        </p>
      </Modal>

      {/* Reject with reason */}
      <Modal
        open={rejectOpen}
        onClose={() => !busy && setRejectOpen(false)}
        title="Reject website"
        description="The customer will see this reason on their dashboard."
        size="md"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setRejectOpen(false)}
              disabled={busy}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={onReject}
              disabled={!reason.trim() || busy}
              loading={busy}
            >
              Reject Website
            </Button>
          </>
        }
      >
        <label
          htmlFor="rejection-reason"
          className="mb-1.5 block text-[12.5px] font-medium text-ink-700"
        >
          Why are you rejecting this website?
        </label>
        <textarea
          id="rejection-reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={4}
          placeholder="e.g. Domain does not resolve. Please verify the URL and resubmit."
          className="w-full resize-none rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-[13.5px] text-ink-900 outline-none placeholder:text-ink-400 focus:border-ink-900"
        />
      </Modal>
    </>
  );
}