"use client";

import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";

export interface AccordionItemData {
  question: string;
  answer: ReactNode;
}

/**
 * Smoothly-animating single-open accordion used by both Troubleshooting and FAQ.
 */
export function Accordion({ items }: { items: AccordionItemData[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="divide-y divide-ink-900/10 overflow-hidden rounded-2xl border border-ink-900/10 bg-white/80 shadow-[0_20px_55px_-42px_rgba(10,10,11,0.55)]">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={i}>
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6"
              aria-expanded={isOpen}
            >
              <span
                className={`text-[14.5px] font-medium transition-colors ${
                  isOpen ? "text-ink-900" : "text-ink-700"
                }`}
              >
                {item.question}
              </span>
              <motion.span
                animate={{ rotate: isOpen ? 45 : 0 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors ${
                  isOpen
                    ? "border-iris-400/40 bg-iris-50 text-iris-700"
                    : "border-ink-900/10 text-ink-500"
                }`}
              >
                <Plus size={15} strokeWidth={2.4} />
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 pr-12 text-[13.5px] leading-relaxed text-ink-600 sm:px-6">
                    {item.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
