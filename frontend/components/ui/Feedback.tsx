import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

/**
 * Inline error block. Used when a fetch fails. Includes a retry button
 * when an `onRetry` is provided.
 */
export function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50/70 px-4 py-3.5 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/5 dark:text-red-300"
    >
      <AlertCircle size={16} className="mt-0.5 shrink-0" />
      <div className="flex-1">
        <p className="font-semibold">{title}</p>
        <p className="mt-0.5 text-[12.5px] opacity-90">{message}</p>
      </div>
      {onRetry && (
        <Button size="sm" variant="secondary" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  action,
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-ink-200 bg-white px-6 py-16 text-center">
      {icon && (
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-ink-50 text-ink-700">
          {icon}
        </div>
      )}
      <h4 className="text-[14px] font-semibold text-ink-900">{title}</h4>
      {description && (
        <p className="mt-1 max-w-sm text-[13px] text-ink-500">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center justify-center gap-2 py-10 text-[13px] text-ink-500"
    >
      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-ink-300 border-r-transparent" />
      {label}
    </div>
  );
}