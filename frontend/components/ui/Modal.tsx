"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  /** Set true for narrow forms (~440px). Default is medium (~520px). */
  size?: "sm" | "md";
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
}: ModalProps) {
  // Close on ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Lock background scroll while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const widths = size === "sm" ? "max-w-[440px]" : "max-w-[520px]";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
    >
      <div
        className="absolute inset-0 bg-ink-900/40"
        onClick={onClose}
        aria-hidden
      />
      <div
        className={[
          "relative w-full overflow-hidden rounded-2xl bg-white shadow-elevated",
          widths,
        ].join(" ")}
      >
        <div className="flex items-start justify-between gap-4 border-b border-ink-100 px-6 py-4">
          <div>
            <h2
              id="modal-title"
              className="text-[15px] font-semibold text-ink-900"
            >
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-[13px] text-ink-500">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="-mr-1 rounded-md p-1.5 text-ink-500 transition-colors hover:bg-ink-50 hover:text-ink-900"
          >
            <X size={16} strokeWidth={2.4} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-ink-100 bg-ink-50/50 px-6 py-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
