import { motion } from "framer-motion";
import {
  Paperclip,
  Mic,
  ArrowUp,
  Square,
  type LucideIcon,
} from "lucide-react";
import { useCallback, useEffect, useState, type KeyboardEvent } from "react";
import { useAutoResize } from "../hooks/useAutoResize";

interface InputBarProps {
  onSend: (text: string) => void;
  isThinking?: boolean;
  onStop?: () => void;
}

/**
 * Sticky bottom input. Auto-resizing textarea, focus glow,
 * Enter to send / Shift+Enter for new line, disabled attach + voice buttons.
 */
export function InputBar({ onSend, isThinking, onStop }: InputBarProps) {
  const [value, setValue] = useState("");
  const ref = useAutoResize(value);

  // Focus the textarea on mount so users can type immediately
  useEffect(() => {
    const t = window.setTimeout(() => ref.current?.focus(), 250);
    return () => window.clearTimeout(t);
  }, [ref]);

  const send = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || isThinking) return;
    onSend(trimmed);
    setValue("");
  }, [value, isThinking, onSend]);

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send();
    }
  };

  const canSend = value.trim().length > 0 && !isThinking;

  return (
    <div className="relative z-10 border-t border-ink-900/[0.06] bg-white/80 px-3 py-2.5 backdrop-blur-xl dark:border-white/[0.06] dark:bg-ink-900/80">
      {/* Focus-glow ring */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-x-3 bottom-3 top-2.5 rounded-2xl ring-1 ring-ink-900/[0.06] transition-all duration-200 focus-within:ring-2 focus-within:ring-accent-500/40 dark:ring-white/[0.06]"
      />

      <div className="relative flex items-end gap-1.5">
        <SideButton Icon={Paperclip} label="Attach file (coming soon)" />
        <SideButton Icon={Mic} label="Voice input (coming soon)" />

        <label htmlFor="chat-input" className="sr-only">
          Message Scrappy
        </label>
        <textarea
          id="chat-input"
          ref={ref}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKey}
          rows={1}
          placeholder="Ask anything about this website…"
          aria-label="Type your message"
          className="flex-1 resize-none bg-transparent px-2 py-2.5 text-[14px] leading-snug text-ink-900 outline-none placeholder:text-ink-400 dark:text-ink-50 dark:placeholder:text-ink-300"
          style={{ maxHeight: 140 }}
        />

        <motion.button
          type="button"
          onClick={isThinking ? onStop : send}
          disabled={!canSend && !isThinking}
          whileTap={{ scale: 0.92 }}
          aria-label={isThinking ? "Stop generating" : "Send message"}
          className={`relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-200 ${
            canSend || isThinking
              ? "bg-gradient-to-br from-accent-500 to-accent-600 text-white shadow-glow"
              : "bg-ink-100 text-ink-400 dark:bg-ink-700 dark:text-ink-300"
          }`}
        >
          {isThinking ? (
            <Square size={14} strokeWidth={2.4} fill="currentColor" />
          ) : (
            <ArrowUp size={16} strokeWidth={2.6} />
          )}
        </motion.button>
      </div>

      <p className="mt-1.5 text-center text-[10.5px] font-medium tracking-wide text-ink-400 dark:text-ink-300">
        <kbd className="rounded border border-ink-200 px-1 py-px font-mono text-[10px] dark:border-ink-600">
          Enter
        </kbd>{" "}
        to send{" "}
        <span className="opacity-40">·</span>{" "}
        <kbd className="rounded border border-ink-200 px-1 py-px font-mono text-[10px] dark:border-ink-600">
          Shift
        </kbd>
        <span className="opacity-40">+</span>
        <kbd className="rounded border border-ink-200 px-1 py-px font-mono text-[10px] dark:border-ink-600">
          Enter
        </kbd>{" "}
        for new line
      </p>
    </div>
  );
}

interface SideButtonProps {
  Icon: LucideIcon;
  label: string;
}

function SideButton({ Icon, label }: SideButtonProps) {
  return (
    <button
      type="button"
      disabled
      aria-label={label}
      title={label}
      className="inline-flex h-9 w-9 shrink-0 cursor-not-allowed items-center justify-center rounded-xl text-ink-300 transition-colors dark:text-ink-400"
    >
      <Icon size={17} strokeWidth={2} />
    </button>
  );
}
