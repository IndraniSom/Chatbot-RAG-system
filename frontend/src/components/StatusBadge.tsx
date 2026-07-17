interface StatusBadgeProps {
  status: "online" | "busy" | "offline";
  /** Show text label next to the dot */
  withLabel?: boolean;
}

/**
 * Small status pill — pulsing green dot + label.
 */
export function StatusBadge({ status, withLabel = true }: StatusBadgeProps) {
  const color =
    status === "online"
      ? "bg-emerald-500"
      : status === "busy"
      ? "bg-amber-500"
      : "bg-ink-400";

  const ringColor =
    status === "online"
      ? "bg-emerald-400/40"
      : status === "busy"
      ? "bg-amber-400/40"
      : "bg-ink-400/40";

  const label = status === "online" ? "Online" : status === "busy" ? "Busy" : "Offline";

  return (
    <div className="inline-flex items-center gap-1.5 text-[11px] font-medium tracking-wide text-ink-500 dark:text-ink-300">
      <span className="relative inline-flex h-2 w-2">
        <span
          className={`absolute inset-0 animate-ping rounded-full ${ringColor}`}
        />
        <span className={`relative inline-block h-2 w-2 rounded-full ${color}`} />
      </span>
      {withLabel && <span>{label}</span>}
    </div>
  );
}
