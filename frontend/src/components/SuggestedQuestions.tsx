import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { SUGGESTED_QUESTIONS } from "../utils/mockResponses";

interface SuggestedQuestionsProps {
  onSelect: (q: string) => void;
}

/**
 * Horizontally scrollable suggestion chips. Uses marquee-style blur fades
 * on the edges using CSS, plus a hover lift via motion.
 */
export function SuggestedQuestions({ onSelect }: SuggestedQuestionsProps) {
  return (
    <div
      className="relative px-4 pb-2 pt-1"
      role="group"
      aria-label="Suggested questions"
    >
      <div
        className="scroll-hide -mx-1 flex gap-2 overflow-x-auto px-1 pb-1"
        style={{ WebkitMaskImage: "linear-gradient(to right, transparent, black 16px, black calc(100% - 16px), transparent)" }}
      >
        {SUGGESTED_QUESTIONS.map((q, i) => (
          <motion.button
            key={q.id}
            type="button"
            onClick={() => onSelect(q.text)}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.04 }}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.97 }}
            className="group inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-ink-900/[0.08] bg-white px-3 py-1.5 text-[12.5px] font-medium text-ink-700 transition-shadow hover:shadow-soft dark:border-white/[0.08] dark:bg-ink-700 dark:text-ink-50 dark:hover:shadow-soft"
          >
            {q.text}
            <ArrowUpRight
              size={12}
              strokeWidth={2.2}
              className="opacity-50 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
            />
          </motion.button>
        ))}
      </div>
    </div>
  );
}
