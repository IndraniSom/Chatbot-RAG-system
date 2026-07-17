import type { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Removes default padding so children can control it. */
  flush?: boolean;
}

export function Card({
  flush = false,
  className = "",
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={[
        "rounded-xl border border-ink-200 bg-white shadow-soft",
        flush ? "" : "p-6",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex items-start justify-between gap-4">
      <div>
        <h3 className="text-[15px] font-semibold text-ink-900">{title}</h3>
        {description && (
          <p className="mt-1 text-[13px] text-ink-500">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
