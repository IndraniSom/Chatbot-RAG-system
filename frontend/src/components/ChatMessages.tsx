import { AnimatePresence } from "framer-motion";
import { useEffect, useRef } from "react";
import type { Message } from "../types";
import { ChatStatus } from "../types";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";

interface ChatMessagesProps {
  messages: Message[];
  status: ChatStatus;
}

/**
 * Scrolls to the bottom whenever messages change or the status flips.
 */
export function ChatMessages({ messages, status }: ChatMessagesProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, status]);

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto px-4 py-4"
      aria-live="polite"
      aria-label="Conversation"
    >
      <div className="flex flex-col gap-3">
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <MessageBubble key={m.id} message={m} />
          ))}
          {status === "thinking" && (
            <div
              key="typing"
              className="flex items-end gap-2 justify-start"
            >
              <TypingIndicator />
            </div>
          )}
        </AnimatePresence>
        <div ref={endRef} />
      </div>
    </div>
  );
}
