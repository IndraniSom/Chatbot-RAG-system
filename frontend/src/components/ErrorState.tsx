import { motion } from "framer-motion";
import { AlertCircle, RotateCw } from "lucide-react";

interface ErrorStateProps {
  onRetry?: () => void;
}

/**
 * Inline error banner with retry CTA. Apple-vibe: dense icon + clean copy.
 */
export function ErrorState({ onRetry }: ErrorStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50/70 px-3 py-2.5 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/5 dark:text-red-300"
      role="alert"
    >
      <AlertCircle size={16} className="mt-0.5 shrink-0" />
      <div className="flex-1">
        <p className="font-medium">Something went off</p>
        <p className="text-[12.5px] opacity-80">
          I couldn't finish that reply. Want me to try again?
        </p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="ml-1 inline-flex items-center gap-1 rounded-md px-2 py-1 text-[12px] font-semibold hover:bg-red-100 dark:hover:bg-red-500/10"
        >
          <RotateCw size={12} /> Retry
        </button>
      )}
    </motion.div>
  );
}
