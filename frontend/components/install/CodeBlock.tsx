"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { highlight, type Lang } from "./highlight";

interface CodeBlockProps {
  code: string;
  lang?: Lang;
  /** Filename / label shown in the window chrome title bar. */
  filename?: string;
  /** Show the three macOS-style traffic-light dots. */
  chrome?: boolean;
  className?: string;
}

/**
 * A premium, self-contained code block: rounded window chrome, gradient border,
 * dependency-free syntax highlighting and a copy-to-clipboard button.
 */
export function CodeBlock({
  code,
  lang = "html",
  filename,
  chrome = true,
  className = "",
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable — no-op */
    }
  };

  return (
    <div
      className={`group relative rounded-2xl bg-gradient-to-b from-white/[0.12] to-white/[0.02] p-px shadow-card-dark ${className}`}
    >
      <div className="overflow-hidden rounded-[15px] bg-[#0B0B12]/95 backdrop-blur">
        <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] px-4 py-2.5">
          <div className="flex items-center gap-3">
            {chrome && (
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]/80" />
              </div>
            )}
            {filename && (
              <span className="font-mono text-[11.5px] text-ink-400">
                {filename}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onCopy}
            aria-label="Copy code"
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[12px] font-medium text-ink-400 transition-colors hover:bg-white/[0.06] hover:text-white"
          >
            {copied ? (
              <>
                <Check size={13} strokeWidth={2.6} className="text-emerald-400" />
                Copied
              </>
            ) : (
              <>
                <Copy size={13} strokeWidth={2.2} />
                Copy
              </>
            )}
          </button>
        </div>
        <pre className="overflow-x-auto px-5 py-4 font-mono text-[12.5px] leading-[1.75] text-ink-100">
          <code>{highlight(code, lang)}</code>
        </pre>
      </div>
    </div>
  );
}
