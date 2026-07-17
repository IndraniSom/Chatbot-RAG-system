interface LoadingStateProps {
  lines?: number;
  className?: string;
}

/**
 * Skeleton placeholder with shimmering bars (used for the first assistant reply).
 */
export function LoadingState({ lines = 3, className = "" }: LoadingStateProps) {
  const widths = ["w-full", "w-11/12", "w-4/5", "w-3/4", "w-5/6"];
  return (
    <div className={`flex gap-2.5 ${className}`} aria-busy="true" aria-live="polite">
      <div className="space-y-2 flex-1">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`h-2.5 rounded-full bg-gradient-to-r from-ink-100 via-ink-50 to-ink-100 dark:from-ink-700 dark:via-ink-800 dark:to-ink-700 bg-[length:200%_100%] animate-shimmer ${
              widths[i % widths.length]
            }`}
          />
        ))}
      </div>
    </div>
  );
}
