"use client";

import { useState } from "react";

export interface FilterOption<T extends string> {
  value: T;
  label: string;
  count?: number;
}

interface FilterTabsProps<T extends string> {
  options: FilterOption<T>[];
  initial?: T;
  onChange?: (value: T) => void;
}

/**
 * Pill-style filter tabs. Controlled by the parent so URL search params and
 * table filtering stay in sync.
 */
export function FilterTabs<T extends string>({
  options,
  initial,
  onChange,
}: FilterTabsProps<T>) {
  const [active, setActive] = useState<T>(initial ?? options[0]!.value);
  const handle = (value: T) => {
    setActive(value);
    onChange?.(value);
  };
  return (
    <div
      role="tablist"
      aria-label="Filter"
      className="inline-flex items-center gap-1 rounded-lg border border-ink-200 bg-white p-1"
    >
      {options.map((opt) => {
        const selected = active === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => handle(opt.value)}
            className={[
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12.5px] font-medium transition-colors",
              selected
                ? "bg-ink-900 text-white"
                : "text-ink-600 hover:bg-ink-50 hover:text-ink-900",
            ].join(" ")}
          >
            {opt.label}
            {typeof opt.count === "number" && (
              <span
                className={[
                  "rounded-md px-1.5 py-0.5 text-[10.5px] font-semibold",
                  selected
                    ? "bg-white/15 text-white"
                    : "bg-ink-100 text-ink-700",
                ].join(" ")}
              >
                {opt.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
