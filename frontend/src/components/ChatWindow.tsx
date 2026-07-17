import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { ChatMessages } from "./ChatMessages";
import { Header } from "./Header";
import { InputBar } from "./InputBar";
import { SuggestedQuestions } from "./SuggestedQuestions";
import { WelcomeScreen } from "./WelcomeScreen";
import { ErrorState } from "./ErrorState";
import { useChat } from "../hooks/useChat";
import type { Theme } from "../types";

interface ChatWindowProps {
  open: boolean;
  onClose: () => void;
  theme: Theme;
  onToggleTheme: () => void;
}

/**
 * The complete chat window. Holds message state via the `useChat` hook
 * (which calls the real /api/chat endpoint) and renders the welcome /
 * messages / suggestion flow.
 */
export function ChatWindow({ open, onClose, theme, onToggleTheme }: ChatWindowProps) {
  const { messages, status, error, send, stop, retryLast, clear } = useChat();

  // Stop any in-flight request if the user closes the window mid-stream.
  useEffect(() => {
    if (!open) stop();
  }, [open, stop]);

  // Close on ESC for accessibility
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Reset the conversation whenever the chat is (re)opened.
  useEffect(() => {
    if (open) clear();
    // We only want to reset on open transitions.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const showWelcome = messages.length === 0;
  const showError = status === "error";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="chat"
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.97 }}
          transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          role="dialog"
          aria-modal="false"
          aria-label="Scrappy AI chat"
          className="grain fixed inset-x-4 bottom-[100px] top-auto z-40 flex max-h-[80vh] flex-col overflow-hidden rounded-3xl border border-white/40 bg-white/90 shadow-elevated backdrop-blur-2xl md:inset-auto md:bottom-[100px] md:right-[24px] md:max-h-[650px] md:w-[380px] dark:border-white/[0.08] dark:bg-ink-900/90"
          style={{
            boxShadow:
              "0 1px 2px rgba(10,10,11,0.05), 0 16px 40px rgba(10,10,11,0.10), 0 30px 80px -16px rgba(61,90,254,0.18)",
          }}
        >
          <Header
            onClose={onClose}
            theme={theme}
            onToggleTheme={onToggleTheme}
          />

          <div className="relative flex min-h-0 flex-1 flex-col bg-white/60 dark:bg-ink-900/40">
            {showWelcome ? (
              <WelcomeScreen onPick={send} />
            ) : (
              <>
                <ChatMessages messages={messages} status={status} />
                <SuggestedQuestions onSelect={send} />
              </>
            )}

            <AnimatePresence>
              {showError && error && (
                <div className="px-4 pb-2">
                  <ErrorState onRetry={retryLast} />
                  <p className="mt-1.5 px-1 text-[11px] text-ink-400 dark:text-ink-300">
                    {error}
                  </p>
                </div>
              )}
            </AnimatePresence>

            <InputBar
              onSend={send}
              isThinking={status === "thinking"}
              onStop={stop}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
