import { Card } from "@/components/ui/Card";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  /** Subtle text below the value. */
  caption?: string;
}

/**
 * Top-of-dashboard stat card. Used in both customer and admin overviews.
 */
export function StatCard({ label, value, icon: Icon, caption }: StatCardProps) {
  return (
    <Card className="flex items-start justify-between gap-4">
      <div>
        <p className="text-[12.5px] font-medium text-ink-500">{label}</p>
        <p className="mt-2 text-[26px] font-semibold tracking-tight text-ink-900">
          {value}
        </p>
        {caption && (
          <p className="mt-1 text-[12px] text-ink-400">{caption}</p>
        )}
      </div>
      <div className="rounded-lg bg-ink-50 p-2 text-ink-700" aria-hidden>
        <Icon size={18} strokeWidth={2} />
      </div>
    </Card>
  );
}
