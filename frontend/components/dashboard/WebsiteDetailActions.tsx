"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ApiError, websitesApi } from "@/lib/api";
import type { WidgetStatus } from "@/types";

interface WebsiteDetailActionsProps {
  websiteId: string;
  widgetInstalled: boolean;
  onWidgetStatusChange?: (s: WidgetStatus) => void;
}

/**
 * Verify-installation button. Calls POST /verify-installation and
 * surfaces the result via toast + parent callback.
 */
export function WebsiteDetailActions({
  websiteId,
  widgetInstalled,
  onWidgetStatusChange,
}: WebsiteDetailActionsProps) {
  const [verifying, setVerifying] = useState(false);
  const [installed, setInstalled] = useState(widgetInstalled);

  const onVerify = async () => {
    setVerifying(true);
    try {
      const result = await websitesApi.verifyInstallation(websiteId);
      setInstalled(result.installed);
      onWidgetStatusChange?.(result.widgetStatus);
      if (result.installed) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.serverMessage ?? err.message
          : "Could not verify installation.";
      toast.error(message);
    } finally {
      setVerifying(false);
    }
  };

  if (installed) return null;

  return (
    <Button
      variant="primary"
      size="sm"
      onClick={onVerify}
      loading={verifying}
      leftIcon={!verifying ? <CheckCircle2 size={14} /> : undefined}
    >
      Verify Installation
    </Button>
  );
}