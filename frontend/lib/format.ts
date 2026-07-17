/**
 * Format an ISO date as a short, human-readable string (e.g. "Apr 22, 2026").
 */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Format an ISO date as a date + time (e.g. "Apr 22, 2026 · 3:30 PM").
 */
export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return `${formatDate(iso)} · ${d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })}`;
}
