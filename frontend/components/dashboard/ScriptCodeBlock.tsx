"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface ScriptCodeBlockProps {
  code: string;
}

/**
 * Code block with a Copy button. Shows a green check briefly after copy.
 */
export function ScriptCodeBlock({ code }: ScriptCodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard may not be available; no-op */
    }
  };
  return (
    <div className="overflow-hidden rounded-xl border border-ink-200 bg-ink-900">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
        <span className="text-[11.5px] font-medium uppercase tracking-wider text-white/60">
          Script
        </span>
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[12px] font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
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
      <pre className="overflow-x-auto px-4 py-4 font-mono text-[12.5px] leading-relaxed text-white/90">
        <code>{code}</code>
      </pre>
    </div>
  );
}
