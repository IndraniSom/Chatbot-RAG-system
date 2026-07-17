import { motion } from "framer-motion";

/**
 * Used by the main app behind the chat window to demonstrate the embed.
 */
export function EmptyState() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-50 px-6 dark:bg-ink-900">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-lg text-center"
      >
        <p className="font-serif text-5xl italic leading-tight text-ink-900 dark:text-white">
          Scrappy <span className="text-accent-500">AI</span>.
        </p>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-500 dark:text-ink-300">
          An embeddable chat widget built with React, TypeScript, Tailwind, and
          Framer Motion. Open the bubble in the corner to begin.
        </p>
      </motion.div>
    </div>
  );
}
