import { useCallback, useRef, useState } from "react";
import { ApiError, chatApi } from "../api";
import type { ChatStatus, Message } from "../types";
import { uid } from "../utils/time";

/**
 * Encapsulates the message-list state, in-flight requests and error handling
 * for ChatWindow. Calls POST /api/chat and surfaces the backend's `reply`.
 *
 *  - `send(text)` adds the user message, sets status to "thinking", and
 *    appends the assistant reply (or sets status to "error") on resolution.
 *  - `stop()` aborts the current request without leaving the UI in a stuck
 *    state.
 *  - `retryLast()` resubmits the most recent user message.
 */
export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState<ChatStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const lastUserTextRef = useRef<string | null>(null);

  const send = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    // Cancel any in-flight request before starting a new one.
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    lastUserTextRef.current = trimmed;

    const userMsg: Message = {
      id: uid(),
      role: "user",
      content: trimmed,
      timestamp: new Date().toISOString(),
      status: "sending",
    };
    setMessages((prev) => [...prev, userMsg]);
    setStatus("thinking");
    setError(null);

    try {
      const data = await chatApi.sendMessage(
        { message: trimmed },
        controller.signal
      );

      // Bail if this request was superseded by a newer send.
      if (abortRef.current !== controller) return;

      const asstMsg: Message = {
        id: uid(),
        role: "assistant",
        content: data.reply,
        timestamp: new Date().toISOString(),
        status: "sent",
      };
      setMessages((prev) => [
        ...prev.map((m) =>
          m.id === userMsg.id ? { ...m, status: "sent" as const } : m
        ),
        asstMsg,
      ]);
      setStatus("idle");
    } catch (err) {
      if (abortRef.current !== controller) return;

      if ((err as { name?: string }).name === "AbortError") {
        // User-cancelled request — quietly revert to idle.
        setStatus("idle");
        setMessages((prev) =>
          prev.map((m) =>
            m.id === userMsg.id ? { ...m, status: "sent" as const } : m
          )
        );
        return;
      }

      const apiErr = err as ApiError;
      const message =
        apiErr?.message ?? "Something went wrong. Please try again.";
      setError(message);
      setStatus("error");
      setMessages((prev) => [
        ...prev.map((m) =>
          m.id === userMsg.id ? { ...m, status: "error" as const } : m
        ),
      ]);
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const retryLast = useCallback(() => {
    const last = lastUserTextRef.current;
    if (last) {
      // Drop the failed user message marker so the next send starts clean.
      setMessages((prev) => prev.slice(0, -1));
      void send(last);
    }
  }, [send]);

  const clear = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    setStatus("idle");
    setError(null);
    lastUserTextRef.current = null;
  }, []);

  return {
    messages,
    status,
    error,
    send,
    stop,
    retryLast,
    clear,
  };
}
