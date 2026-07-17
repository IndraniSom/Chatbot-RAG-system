import { motion } from "framer-motion";
import { Check } from "lucide-react";
import type { Message } from "../types";
import { Avatar } from "./Avatar";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { formatTime } from "../utils/time";

interface MessageBubbleProps {
  message: Message;
}

/**
 * Single chat bubble. User messages use an indigo gradient with white text.
 * Assistant messages use a soft neutral background with markdown rendering.
 *
 * Reduced motion respects prefers-reduced-motion via framer's `useReducedMotion`
 * but kept simple here — a soft fade-in + slight rise.
 */
export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      className={`flex w-full items-end gap-2 ${
        isUser ? "justify-end" : "justify-start"
      }`}
      role="article"
      aria-label={`${isUser ? "You" : "Assistant"} said`}
    >
      {!isUser && <Avatar size="sm" />}

      <div
        className={`flex max-w-[80%] flex-col gap-1 ${
          isUser ? "items-end" : "items-start"
        }`}
      >
        <motion.div
          layout="position"
          className={`relative overflow-hidden rounded-2xl px-3.5 py-2.5 shadow-soft ${
            isUser
              ? "rounded-br-md bg-gradient-to-br from-accent-500 to-accent-600 text-white"
              : "rounded-bl-md bg-white text-ink-900 ring-1 ring-ink-900/[0.06] dark:bg-ink-700 dark:text-ink-50 dark:ring-white/[0.06]"
          }`}
        >
          {/* Subtle gloss on user bubble */}
          {isUser && (
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_25%_15%,rgba(255,255,255,0.18),transparent_55%)]" />
          )}

          {isUser ? (
            <div className="whitespace-pre-wrap break-words text-[14px] leading-relaxed">
              {message.content}
            </div>
          ) : (
            <MarkdownRenderer content={message.content} />
          )}
        </motion.div>

        {/* Meta: timestamp + status */}
        <div
          className={`flex items-center gap-1 px-1 text-[10.5px] font-medium tracking-wide text-ink-400 dark:text-ink-300 ${
            isUser ? "flex-row-reverse" : ""
          }`}
        >
          <span>{formatTime(message.timestamp)}</span>
          {isUser && (
            <Check size={11} className="text-accent-500" strokeWidth={3} />
          )}
        </div>
      </div>
    </motion.div>
  );
}
