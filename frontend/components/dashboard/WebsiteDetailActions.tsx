"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, Loader2 } from "lucide-react";

/**
 * Client-side controls for the website detail page:
 *  - Verify Installation (mock — flips a local state).
 *  - Reindex Knowledge (mock — flips a local state).
 */
export function WebsiteDetailActions({
  widgetInstalled: initialInstalled,
  indexingStatus: initialStatus,
}: {
  widgetInstalled: boolean;
  indexingStatus: "NOT_INDEXED" | "INDEXING" | "INDEXED" | "FAILED";
}) {
  const [installed, setInstalled] = useState(initialInstalled);
  const [verifying, setVerifying] = useState(false);
  const [reindexing, setReindexing] = useState(false);
  const [status, setStatus] = useState(initialStatus);

  const verify = () => {
    setVerifying(true);
    window.setTimeout(() => {
      setInstalled(true);
      setVerifying(false);
    }, 900);
  };

  const reindex = () => {
    setStatus("INDEXING");
    setReindexing(true);
    window.setTimeout(() => {
      setStatus("INDEXED");
      setReindexing(false);
    }, 1400);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {!installed && (
        <Button
          variant="primary"
          size="sm"
          onClick={verify}
          loading={verifying}
          leftIcon={!verifying ? <CheckCircle2 size={14} /> : undefined}
        >
          Verify Installation
        </Button>
      )}
      <Button
        variant="secondary"
        size="sm"
        onClick={reindex}
        loading={reindexing}
        leftIcon={!reindexing ? <Loader2 size={14} /> : undefined}
      >
        {status === "INDEXED" ? "Reindex Knowledge" : "Start Indexing"}
      </Button>
    </div>
  );
}
