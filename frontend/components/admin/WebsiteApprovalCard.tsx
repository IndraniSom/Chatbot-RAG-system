"use client";

import { useState } from "react";
import { ExternalLink, X, Check } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import type { User } from "@/types/user";
import type { Website } from "@/types/website";
import { formatDate } from "@/lib/format";

interface WebsiteApprovalCardProps {
  website: Website;
  owner: User | undefined;
}

export function WebsiteApprovalCard({
  website,
  owner,
}: WebsiteApprovalCardProps) {
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [resolved, setResolved] = useState<"APPROVED" | "REJECTED" | null>(
    null
  );

  if (resolved) {
    return (
      <Card className="flex items-center justify-between gap-3">
        <p className="text-[13px] text-ink-500">
          <span className="font-medium text-ink-900">{website.name}</span> has
          been {resolved === "APPROVED" ? "approved" : "rejected"}.
        </p>
        <button
          type="button"
          onClick={() => setResolved(null)}
          className="text-[12px] font-medium text-ink-500 hover:text-ink-900"
        >
          Undo
        </button>
      </Card>
    );
  }

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
        onClose={() => setApproveOpen(false)}
        title="Approve website"
        description={`Approve ${website.name} and let the customer install Scrappy?`}
        size="sm"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setApproveOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setApproveOpen(false);
                setResolved("APPROVED");
              }}
            >
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
        onClose={() => setRejectOpen(false)}
        title="Reject website"
        description="The customer will see this reason on their dashboard."
        size="md"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setRejectOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                setRejectOpen(false);
                setResolved("REJECTED");
              }}
              disabled={!reason.trim()}
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
