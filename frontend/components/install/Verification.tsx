"use client";

import { motion } from "framer-motion";
import {
  FileCode2,
  ScanLine,
  Bot,
  Check,
  type LucideIcon,
} from "lucide-react";
import { SectionHeader } from "./SectionHeader";

const checks: { icon: LucideIcon; label: string; detail: string }[] = [
  {
    icon: FileCode2,
    label: "Checks script tag",
    detail: "Fetches your page and confirms the widget snippet is present and well-formed.",
  },
  {
    icon: ScanLine,
    label: "Verifies widget",
    detail: "Loads the widget in a sandbox to make sure it initialises without errors.",
  },
  {
    icon: Bot,
    label: "Activates chatbot",
    detail: "Flips your assistant live so it starts answering real visitors instantly.",
  },
];

export function Verification() {
  return (
    <section id="verify" className="mx-auto max-w-6xl px-6 py-24 sm:py-28">
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <SectionHeader
            eyebrow="Verification"
            title="One click to go live"
            description="After installing, open your Scrappy dashboard and press Verify Installation. Here's exactly what happens behind the scenes."
          />
          <div className="mt-8 space-y-3">
            {checks.map((c, i) => (
              <motion.div
                key={c.label}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: i * 0.12, duration: 0.5 }}
                className="flex items-start gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-iris-400/20 bg-iris-500/10 text-iris-300">
                  <c.icon size={18} strokeWidth={2} />
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-white">
                    {c.label}
                  </p>
                  <p className="mt-0.5 text-[13px] leading-relaxed text-ink-400">
                    {c.detail}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Illustration */}
        <VerifyIllustration />
      </div>
    </section>
  );
}

function VerifyIllustration() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="relative"
    >
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-iris-600/20 blur-[100px]" />
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent p-8">
        {/* animated scan sweep */}
        <motion.div
          aria-hidden
          initial={{ y: "-120%" }}
          whileInView={{ y: "120%" }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 1.4, ease: "easeInOut" }}
          className="pointer-events-none absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-iris-400/25 to-transparent"
        />

        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.9, type: "spring", stiffness: 260, damping: 16 }}
            className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-400/40"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.6)]">
              <Check size={30} strokeWidth={3} className="text-white" />
            </div>
          </motion.div>
          <p className="mt-5 text-[15px] font-semibold text-white">
            Installation verified
          </p>
          <p className="mt-1 text-[13px] text-ink-400">
            Your Scrappy assistant is now live.
          </p>

          {/* fake status rows */}
          <div className="mt-6 w-full space-y-2">
            {["Script tag detected", "Widget initialised", "Chatbot activated"].map(
              (row, i) => (
                <motion.div
                  key={row}
                  initial={{ opacity: 0, x: 12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1 + i * 0.15, duration: 0.4 }}
                  className="flex items-center gap-2.5 rounded-lg border border-white/[0.06] bg-black/20 px-3.5 py-2.5 text-left"
                >
                  <Check size={14} strokeWidth={3} className="text-emerald-400" />
                  <span className="text-[12.5px] text-ink-200">{row}</span>
                </motion.div>
              )
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
