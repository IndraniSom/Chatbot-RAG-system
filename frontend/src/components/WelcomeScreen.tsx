import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Avatar } from "./Avatar";

interface WelcomeScreenProps {
  onPick: (text: string) => void;
}

/**
 * The signature screen. Uses an *italic serif* headline — the one detail
 * that elevates this above a generic SaaS chatbot.
 */
export function WelcomeScreen({ onPick }: WelcomeScreenProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 240, damping: 22, delay: 0.05 }}
        className="relative mb-5"
      >
        {/* Glow ring */}
        <div className="absolute inset-0 -m-6 rounded-full bg-accent-500/10 blur-2xl" />
        <Avatar size="lg" />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.12 }}
        className="font-serif text-[28px] leading-tight tracking-tight"
      >
        Hi, I'm <span className="italic text-accent-500">Scrappy</span> AI
        <span className="ml-1">👋</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.18 }}
        className="mt-2 max-w-[280px] text-[13.5px] leading-relaxed text-ink-500 dark:text-ink-300"
      >
        I can answer questions about this website. Ask me anything — pricing,
        docs, refunds, or just say hi.
      </motion.p>

      <div className="mt-6 w-full max-w-[300px] space-y-2">
        {["How do I contact support?", "What are your pricing plans?", "How can I reset my password?", "Where is your documentation?"].map((q, i) => (
          <motion.button
            key={q}
            type="button"
            onClick={() => onPick(q)}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.22 + i * 0.06 }}
            whileHover={{ x: 2 }}
            className="group flex w-full items-center justify-between rounded-xl border border-ink-900/[0.06] bg-white/70 px-3 py-2.5 text-left text-[13px] text-ink-700 transition-shadow hover:shadow-soft dark:border-white/[0.06] dark:bg-ink-700/60 dark:text-ink-50"
          >
            <span>{q}</span>
            <ArrowRight
              size={14}
              strokeWidth={2}
              className="opacity-40 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100 group-hover:text-accent-500"
            />
          </motion.button>
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        className="mt-6 flex items-center gap-1.5 text-[11px] font-medium text-ink-400 dark:text-ink-300"
      >
        <span className="inline-block h-1 w-1 rounded-full bg-emerald-500" />
        Powered by Scrappy · answers in ~2s
      </motion.p>
    </div>
  );
}
