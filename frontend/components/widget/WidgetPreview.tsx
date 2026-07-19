"use client";

import { useEffect, useMemo, useState } from "react";
import { Bot, Send } from "lucide-react";
import type { WebsiteAppearance } from "@/types";

export type WidgetPreviewMode = "full" | "compact";
export type WidgetPreviewDemoState = "idle" | "thinking" | "answered";

interface WidgetPreviewProps {
  appearance: WebsiteAppearance;
  /** Bot name shown in the header — defaults to "Scrappy". */
  botName?: string;
  /** Initial assistant message shown when the panel opens. */
  greeting?: string;
  /** Optional wrapper className passthrough. */
  className?: string;
  /**
   * - "full" (default): wraps the panel in faux browser chrome — for
   *   dashboard editors that want to preview "the widget inside a site".
   * - "compact": renders the launcher + chat panel only, no chrome — for
   *   landing-page hero/showcase usage where the surrounding layout is
   *   already framed.
   */
  mode?: WidgetPreviewMode;
  /**
   * Demo conversation state used by the showcase. Drives which scripted
   * bubbles render. The dashboard editor always shows a complete sample
   * regardless of this prop.
   */
  demoState?: WidgetPreviewDemoState;
}

/**
 * Mirrors the polished widget look so dashboard editors can preview changes
 * before saving. Pure CSS / inline styles — no Tailwind theme edits, no
 * global font changes. Uses the "zilla-slab" CSS class with a serif fallback
 * so the brand feel matches without re-loading the font globally.
 *
 * Black/white foreground is derived from the supplied primary color's
 * luminance — same WCAG-ish formula used by the real widget.
 */
export function WidgetPreview({
  appearance,
  botName = "Scrappy",
  greeting = "Hi there! How can I help you today?",
  className = "",
  mode = "full",
  demoState = "idle",
}: WidgetPreviewProps) {
  const primary = appearance.primaryColor;
  const surface = appearance.surfaceColor;
  const fgOnPrimary = useMemo(() => pickForeground(primary), [primary]);
  const fgOnSurface = useMemo(() => pickForeground(surface), [surface]);

  // Start closed so owners can preview the launcher invitation as visitors see it.
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");

  // Reset the message input when the appearance changes so the editor can
  // play around freely without leaking stale input state.
  useEffect(() => {
    setDraft("");
  }, [primary, surface]);

  // Keep the same closed-first launcher state in every preview mode.
  useEffect(() => {
    setOpen(false);
  }, [mode]);

  const bubbles = useMemo(() => buildBubbles(demoState, greeting), [
    demoState,
    greeting,
  ]);

  const panel = (
    <div
      role="dialog"
      aria-label={`${botName} chat preview`}
      className={[
        "flex w-full flex-col overflow-hidden rounded-2xl border border-black/5 shadow-elevated",
        mode === "compact" ? "max-w-[320px]" : "max-w-[320px]",
      ].join(" ")}
      style={{
        background: "var(--wp-surface)",
        color: "var(--wp-fg-on-surface)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2.5 px-4 py-3"
        style={{ background: "var(--wp-primary)", color: "var(--wp-fg-on-primary)" }}
      >
        <LogoBadge
          logoUrl={appearance.logoUrl}
          fallbackBg={primary}
          fg={fgOnPrimary}
          size={32}
        />
        <div className="min-w-0">
          <p className="zilla-slab truncate text-[14px] font-semibold leading-tight">
            {botName}
          </p>
          <p className="text-[11px] opacity-80">Online</p>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 space-y-3 overflow-auto px-3 py-4">
        {bubbles.map((b, i) => (
          <ChatBubble
            key={i}
            side={b.side}
            text={b.text}
            thinking={b.thinking}
            primary={primary}
            fgOnPrimary={fgOnPrimary}
            fgOnSurface={fgOnSurface}
          />
        ))}
      </div>

      {/* Composer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setDraft("");
        }}
        className="flex items-center gap-2 border-t border-black/5 px-3 py-2.5"
      >
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type a message…"
          aria-label="Type a message"
          className="flex-1 rounded-lg bg-black/5 px-3 py-2 text-[13px] outline-none placeholder:text-current placeholder:opacity-40"
        />
        <button
          type="submit"
          aria-label="Send"
          className="flex h-9 w-9 items-center justify-center rounded-lg transition-opacity disabled:opacity-50"
          style={{
            background: "var(--wp-primary)",
            color: "var(--wp-fg-on-primary)",
          }}
          disabled={!draft.trim()}
        >
          <Send size={15} strokeWidth={2.2} />
        </button>
      </form>
    </div>
  );

  const launcher = (
    <button
      type="button"
      onClick={() => setOpen((current) => !current)}
      aria-label={open ? "Close chat" : "Open chat"}
      aria-expanded={open}
      className="absolute bottom-4 right-4 z-20 flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      style={{
        background: "var(--wp-primary)",
        color: "var(--wp-fg-on-primary)",
      }}
    >
      <Bot size={20} strokeWidth={2.2} />
    </button>
  );

  const invite = !open ? (
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-label="Open chat — hey, let's talk"
      className="zilla-slab absolute bottom-[76px] right-4 z-10 rounded-[13px_13px_4px_13px] border border-black/10 bg-white px-3.5 py-2.5 text-left text-ink-900 shadow-[0_14px_32px_-18px_rgba(10,10,11,0.5)] transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
    >
      <strong className="block text-[13px] font-semibold leading-none">
        Hey, let&apos;s talk
      </strong>
      <span className="mt-1 block text-[10px] italic text-ink-500">
        Ask me anything
      </span>
    </button>
  ) : null;

  // Compact: panel, invite, and launcher share one bottom-right anchor.
  if (mode === "compact") {
    return (
      <div
        className={["relative isolate", className].join(" ")}
        style={
          {
            "--wp-primary": primary,
            "--wp-surface": surface,
            "--wp-fg-on-primary": fgOnPrimary,
            "--wp-fg-on-surface": fgOnSurface,
          } as React.CSSProperties
        }
      >
        <div className="relative mx-auto h-[390px] w-full max-w-[360px]">
          {open && (
            <div className="absolute bottom-[76px] right-4 w-[min(320px,calc(100%-1rem))]">
              {panel}
            </div>
          )}
          {invite}
          {launcher}
        </div>

        <style jsx>{`
          .zilla-slab {
            font-family: "Zilla Slab", "Zilla Slab Highlight", Georgia,
              "Times New Roman", serif;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div
      className={["relative isolate", className].join(" ")}
      // CSS variables let every nested element reach the colors without us
      // threading them through as props or classNames.
      style={
        {
          "--wp-primary": primary,
          "--wp-surface": surface,
          "--wp-fg-on-primary": fgOnPrimary,
          "--wp-fg-on-surface": fgOnSurface,
        } as React.CSSProperties
      }
    >
      {/* Faux browser chrome so it reads as "the widget inside a site". */}
      <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-soft">
        <div className="flex items-center gap-1.5 border-b border-ink-100 bg-ink-50 px-3 py-2">
          <span className="h-2.5 w-2.5 rounded-full bg-ink-200" aria-hidden />
          <span className="h-2.5 w-2.5 rounded-full bg-ink-200" aria-hidden />
          <span className="h-2.5 w-2.5 rounded-full bg-ink-200" aria-hidden />
          <span className="ml-2 truncate text-[11px] font-medium text-ink-400">
            your-site.com
          </span>
        </div>

        <div className="relative h-[360px] bg-gradient-to-b from-ink-50 to-white sm:h-[420px]">
          {open && (
            <div className="absolute bottom-[76px] right-4 w-[min(320px,calc(100%-2rem))]">
              {panel}
            </div>
          )}
          {invite}
          {launcher}
        </div>
      </div>

      <style jsx>{`
        .zilla-slab {
          font-family: "Zilla Slab", "Zilla Slab Highlight", Georgia,
            "Times New Roman", serif;
        }
      `}</style>
    </div>
  );
}

function buildBubbles(
  state: WidgetPreviewDemoState,
  greeting: string
): Array<{ side: "bot" | "user"; text: string; thinking?: boolean }> {
  // Dashboard editors always want a complete sample so the spec contract is
  // identical regardless of demoState. The showcase state tweaks which
  // scripted bubbles render.
  if (state === "idle") {
    return [
      { side: "bot", text: greeting },
      { side: "user", text: "What does this widget do?" },
      {
        side: "bot",
        text: "It answers questions from your indexed site, in your brand's voice and colors.",
      },
    ];
  }
  if (state === "thinking") {
    return [
      { side: "bot", text: greeting },
      { side: "user", text: "What are your shipping options?" },
      { side: "bot", text: "", thinking: true },
    ];
  }
  // answered
  return [
    { side: "bot", text: greeting },
    { side: "user", text: "What are your shipping options?" },
    {
      side: "bot",
      text: "We ship within the US in 3–5 business days, free over $50. International orders arrive in 7–14 days.",
    },
  ];
}

function ChatBubble({
  side,
  text,
  thinking,
  primary,
  fgOnPrimary,
  fgOnSurface,
}: {
  side: "bot" | "user";
  text: string;
  thinking?: boolean;
  primary: string;
  fgOnPrimary: string;
  fgOnSurface: string;
}) {
  if (side === "bot") {
    return (
      <div className="flex justify-start">
        <div
          className="max-w-[80%] rounded-2xl rounded-bl-md px-3 py-2 text-[12.5px] leading-snug"
          style={{
            background: "rgba(0,0,0,0.06)",
            color: "var(--wp-fg-on-surface)",
          }}
        >
          {thinking ? (
            <span className="inline-flex items-center gap-1" aria-label="Thinking">
              <span
                className="h-1.5 w-1.5 animate-bounce rounded-full"
                style={{ background: "var(--wp-fg-on-surface)", animationDelay: "0ms" }}
              />
              <span
                className="h-1.5 w-1.5 animate-bounce rounded-full"
                style={{ background: "var(--wp-fg-on-surface)", animationDelay: "150ms" }}
              />
              <span
                className="h-1.5 w-1.5 animate-bounce rounded-full"
                style={{ background: "var(--wp-fg-on-surface)", animationDelay: "300ms" }}
              />
            </span>
          ) : (
            text
          )}
        </div>
      </div>
    );
  }
  return (
    <div className="flex justify-end">
      <div
        className="max-w-[80%] rounded-2xl rounded-br-md px-3 py-2 text-[12.5px] leading-snug"
        style={{ background: primary, color: fgOnPrimary }}
      >
        {text}
      </div>
    </div>
  );
}

function LogoBadge({
  logoUrl,
  fallbackBg,
  fg,
  size,
}: {
  logoUrl?: string;
  fallbackBg: string;
  fg: string;
  size: number;
}) {
  const [failed, setFailed] = useState(false);
  // Reset error state whenever the URL changes (e.g. after a fresh upload).
  useEffect(() => {
    setFailed(false);
  }, [logoUrl]);

  const showLogo = !!logoUrl && !failed;
  return (
    <span
      className="relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full ring-1 ring-black/5"
      style={{
        width: size,
        height: size,
        background: fallbackBg,
        color: fg,
      }}
      aria-hidden
    >
      {showLogo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logoUrl}
          alt=""
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <Bot size={Math.round(size * 0.55)} strokeWidth={2.2} />
      )}
    </span>
  );
}

/**
 * Pick black or white text for legibility against a hex background.
 * Uses the standard relative-luminance formula. Returns `#FFFFFF` when the
 * color is dark, `#0A0A0B` (our ink-900) when it's light.
 */
function pickForeground(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return "#FFFFFF";
  // sRGB → linear
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const L = 0.2126 * lin(rgb.r) + 0.7152 * lin(rgb.g) + 0.0722 * lin(rgb.b);
  return L > 0.55 ? "#0A0A0B" : "#FFFFFF";
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const cleaned = hex.trim().replace("#", "");
  if (cleaned.length !== 6) return null;
  const r = parseInt(cleaned.slice(0, 2), 16);
  const g = parseInt(cleaned.slice(2, 4), 16);
  const b = parseInt(cleaned.slice(4, 6), 16);
  if ([r, g, b].some((n) => Number.isNaN(n))) return null;
  return { r, g, b };
}
