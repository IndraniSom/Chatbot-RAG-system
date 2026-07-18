"use client";

import { motion } from "framer-motion";
import {
  UserPlus,
  Globe2,
  Code2,
  ClipboardPaste,
  ShieldCheck,
  MessagesSquare,
  type LucideIcon,
} from "lucide-react";
import { SectionHeader } from "./SectionHeader";

const steps: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: UserPlus,
    title: "Create Account",
    body: "Sign up for Scrappy AI — free, no credit card required.",
  },
  {
    icon: Globe2,
    title: "Register Website",
    body: "Add your domain so Scrappy can index and understand it.",
  },
  {
    icon: Code2,
    title: "Get Script Tag",
    body: "Copy the personalised snippet with your website ID.",
  },
  {
    icon: ClipboardPaste,
    title: "Paste Script",
    body: "Drop it before the closing </body> tag on your site.",
  },
  {
    icon: ShieldCheck,
    title: "Verify Installation",
    body: "Run the one-click check from your dashboard.",
  },
  {
    icon: MessagesSquare,
    title: "Start Chatting",
    body: "Your AI assistant is live and answering visitors.",
  },
];

export function InstallationFlow() {
  return (
    <section id="flow" className="mx-auto max-w-6xl px-6 py-24 sm:py-28">
      <SectionHeader
        eyebrow="How it works"
        title="From zero to live in six steps"
        description="A guided path from sign-up to your first conversation. Each step takes seconds."
        center
      />

      <div className="relative mt-16">
        {/* connecting line — horizontal on desktop, vertical on mobile */}
        <div className="pointer-events-none absolute inset-0">
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.1, ease: "easeInOut" }}
            className="absolute left-0 right-0 top-7 hidden h-px origin-left bg-gradient-to-r from-iris-500/0 via-iris-500/50 to-iris-500/0 lg:block"
          />
        </div>

        <ol className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-6 lg:gap-x-3">
          {steps.map((s, i) => (
            <motion.li
              key={s.title}
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                delay: i * 0.1,
                duration: 0.55,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="relative flex flex-row items-start gap-4 lg:flex-col lg:items-center lg:text-center"
            >
              <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-[#0B0B12] shadow-card-dark">
                <span className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-iris-500 text-[11px] font-bold text-white shadow-glow">
                  {i + 1}
                </span>
                <s.icon size={22} strokeWidth={1.9} className="text-iris-300" />
              </div>
              <div className="lg:mt-4">
                <h3 className="text-[14px] font-semibold text-white">
                  {s.title}
                </h3>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-400 lg:px-1">
                  {s.body}
                </p>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
