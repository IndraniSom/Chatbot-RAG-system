"use client";

import { Github, MessageCircle, Twitter } from "lucide-react";

const columns = [
  {
    title: "Product",
    links: [
      { label: "Documentation", href: "#top" },
      { label: "Dashboard", href: "/dashboard" },
      { label: "API", href: "#api" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Support", href: "#troubleshooting" },
      { label: "FAQ", href: "#faq" },
      { label: "Status", href: "#" },
    ],
  },
];

const socials = [
  { icon: Github, label: "GitHub", href: "#" },
  { icon: MessageCircle, label: "Discord", href: "#" },
  { icon: Twitter, label: "Twitter", href: "#" },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/[0.06]">
      <div className="pointer-events-none absolute inset-x-0 bottom-[-8rem] -z-10 mx-auto h-64 max-w-4xl rounded-full bg-iris-700/20 blur-[120px]" />
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-2">
            <div className="inline-flex items-center gap-2.5">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-iris-400 to-iris-600">
                <svg viewBox="0 0 32 32" width={18} height={18} fill="none" aria-hidden>
                  <circle cx="13" cy="14" r="2" fill="white" />
                  <circle cx="19" cy="14" r="2" fill="white" />
                  <path
                    d="M11 19.5 Q16 22.5 21 19.5"
                    stroke="white"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <span className="text-[15px] font-semibold tracking-tight text-white">
                Scrappy<span className="text-iris-400"> AI</span>
              </span>
            </div>
            <p className="mt-4 max-w-xs text-[13.5px] leading-relaxed text-ink-400">
              An AI-powered chatbot for any website. Install in one line, answer
              customers in seconds.
            </p>
            <div className="mt-5 flex items-center gap-2.5">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-ink-400 transition-colors hover:border-iris-400/40 hover:text-white"
                >
                  <s.icon size={16} strokeWidth={2} />
                </a>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-[12px] font-semibold uppercase tracking-wider text-ink-500">
                {col.title}
              </h4>
              <ul className="mt-4 space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="text-[13.5px] text-ink-300 transition-colors hover:text-white"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-white/[0.06] pt-6 sm:flex-row sm:items-center">
          <p className="text-[12.5px] text-ink-500">
            © 2026 Scrappy AI, Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-5 text-[12.5px] text-ink-500">
            <a href="#" className="transition-colors hover:text-ink-200">
              Privacy
            </a>
            <a href="#" className="transition-colors hover:text-ink-200">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
