"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, ArrowUpRight } from "lucide-react";

const navLinks = [
  { label: "Overview", href: "#top" },
  { label: "Customize", href: "#customize" },
  { label: "Steps", href: "#flow" },
  { label: "Frameworks", href: "#frameworks" },
  { label: "Verify", href: "#verify" },
  { label: "API", href: "#api" },
  { label: "FAQ", href: "#faq" },
];

function Mark() {
  return (
    <a href="#top" className="inline-flex items-center gap-2.5">
      <span className="relative inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-iris-400 to-iris-600 shadow-glow">
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
      <span className="text-[15px] font-semibold tracking-tight text-ink-900">
        Scrappy
        <span className="text-iris-400"> AI</span>
      </span>
    </a>
  );
}

export function NavBar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-ink-900/10 bg-[#F8F5EE]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Mark />
          <nav className="hidden items-center gap-6 lg:flex">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-[13.5px] font-medium text-ink-600 transition-colors hover:text-ink-900"
              >
                {l.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="hidden items-center gap-3 sm:flex">
          <a
            href="/login"
            className="text-[13.5px] font-medium text-ink-600 transition-colors hover:text-ink-900"
          >
            Sign in
          </a>
          <motion.a
            href="/signup"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-ink-900 px-4 text-[13px] font-semibold text-white shadow-[0_12px_30px_-18px_rgba(10,10,11,0.7)] transition-colors hover:bg-ink-700"
          >
            Open Dashboard
            <ArrowUpRight size={15} strokeWidth={2.4} />
          </motion.a>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-ink-900/10 bg-white/70 text-ink-800 lg:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-ink-900/10 bg-[#F8F5EE] lg:hidden"
          >
            <nav className="flex flex-col gap-1 px-6 py-4">
              {navLinks.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-[14px] font-medium text-ink-700 transition-colors hover:bg-white hover:text-ink-900"
                >
                  {l.label}
                </a>
              ))}
              <a
                href="/signup"
                className="mt-2 inline-flex h-10 items-center justify-center rounded-lg bg-iris-500 text-[14px] font-semibold text-white"
              >
                Open Dashboard
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
