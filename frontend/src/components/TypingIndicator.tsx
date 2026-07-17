import { motion } from "framer-motion";

/**
 * Three-dot bouncing indicator. Staggered delay gives a wave-like rhythm.
 */
export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="inline-flex items-center gap-1 rounded-full bg-ink-100 px-3 py-2 dark:bg-ink-700"
      role="status"
      aria-label="Assistant is typing"
    >
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="block h-1.5 w-1.5 rounded-full bg-ink-400 dark:bg-ink-300"
          animate={{ y: [0, -3, 0], opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.15,
          }}
        />
      ))}
    </motion.div>
  );
}
