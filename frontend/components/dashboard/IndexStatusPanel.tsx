"use client";

import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { IndexingStatusBadge } from "@/components/ui/Badge";
import { ApiError, websitesApi } from "@/lib/api";
import type { IndexStatus, IndexingStatus } from "@/types";
import { formatDateTime } from "@/lib/format";

interface IndexStatusPanelProps {
  websiteId: string;
  websiteStatus: "PENDING" | "APPROVED" | "REJECTED";
  initialStatus: IndexingStatus;
  initialLastIndexedAt?: string | null;
  onIndexingChange?: (s: IndexingStatus) => void;
}

const POLL_INTERVAL_MS = 2000;

/**
 * Polls `/api/websites/:id/index-status` every 2 seconds while the website
 * is INDEXING. Stops on INDEXED / FAILED, and exposes a "Start indexing"
 * CTA that POSTs to `/index`.
 */
export function IndexStatusPanel({
  websiteId,
  websiteStatus,
  initialStatus,
  initialLastIndexedAt,
  onIndexingChange,
}: IndexStatusPanelProps) {
  const [status, setStatus] = useState<IndexingStatus>(initialStatus);
  const [progress, setProgress] = useState<number>(0);
  const [lastIndexedAt, setLastIndexedAt] = useState<string | null>(
    initialLastIndexedAt ?? null
  );
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Tell the parent (the page) so the header badge stays in sync.
  useEffect(() => {
    onIndexingChange?.(status);
  }, [status, onIndexingChange]);

  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const poll = async () => {
    try {
      const res = await websitesApi.getIndexStatus(websiteId);
      const next: IndexStatus = res;
      setStatus(next.indexingStatus);
      setProgress(typeof next.progress === "number" ? next.progress : 0);
      setLastIndexedAt(next.lastIndexedAt);
      setError(next.lastIndexingError);

      if (next.indexingStatus !== "INDEXING") {
        stopPolling();
        if (next.indexingStatus === "INDEXED") {
          toast.success("Indexing complete!");
        } else if (next.indexingStatus === "FAILED") {
          toast.error("Indexing failed. See error message below.");
        }
      }
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.serverMessage ?? err.message
          : "Failed to fetch indexing status.";
      setError(message);
      stopPolling();
    }
  };

  // Start polling if we land on the page already in INDEXING.
  useEffect(() => {
    if (initialStatus === "INDEXING" && !intervalRef.current) {
      intervalRef.current = setInterval(poll, POLL_INTERVAL_MS);
    }
    return stopPolling;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onStart = async () => {
    if (websiteStatus !== "APPROVED") {
      toast.error("Website must be approved before indexing.");
      return;
    }
    setStarting(true);
    try {
      await websitesApi.startIndex(websiteId, 20);
      toast.success("Indexing started.");
      setStatus("INDEXING");
      setProgress(0);
      setError(null);
      if (!intervalRef.current) {
        intervalRef.current = setInterval(poll, POLL_INTERVAL_MS);
      }
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.serverMessage ?? err.message
          : "Could not start indexing.";
      toast.error(message);
    } finally {
      setStarting(false);
    }
  };

  const indexing = status === "INDEXING";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <IndexingStatusBadge status={status} />
        {websiteStatus === "APPROVED" && !indexing && (
          <button
            type="button"
            onClick={onStart}
            disabled={starting}
            className="inline-flex items-center gap-1.5 rounded-md border border-ink-200 bg-white px-3 py-1.5 text-[12.5px] font-medium text-ink-700 transition-colors hover:bg-ink-50 disabled:opacity-50"
          >
            {starting
              ? "Starting…"
              : status === "INDEXED"
              ? "Reindex"
              : "Start indexing"}
          </button>
        )}
      </div>

      {indexing && (
        <div className="space-y-1.5">
          <div className="h-2 w-full overflow-hidden rounded-full bg-ink-100">
            <div
              className="h-full rounded-full bg-accent-500 transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(5, progress))}%` }}
            />
          </div>
          <p className="text-[11.5px] text-ink-500">
            Indexing… {progress}%
          </p>
        </div>
      )}

      {!indexing && lastIndexedAt && (
        <p className="text-[11.5px] text-ink-500">
          Last indexed {formatDateTime(lastIndexedAt)}
        </p>
      )}

      {error && (
        <p className="text-[12px] font-medium text-red-600">{error}</p>
      )}
    </div>
  );
}