"use client";

import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Terminal } from "lucide-react";
import { highlight } from "./highlight";
import { SCRIPT_SNIPPET } from "./snippet";

const codeLines = SCRIPT_SNIPPET.split("\n");

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-16 sm:pt-24 lg:pt-28">
      {/* soft gradient glow + drifting blobs behind the hero */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-6rem] h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-iris-600/20 blur-[120px] animate-blob-drift" />
        <div className="absolute right-[6%] top-[8rem] h-72 w-72 rounded-full bg-fuchsia-600/10 blur-[110px] animate-blob-drift [animation-delay:-6s]" />
        <div className="absolute left-[4%] top-[16rem] h-64 w-64 rounded-full bg-blue-600/10 blur-[110px] animate-blob-drift [animation-delay:-11s]" />
      </div>

      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-10">
        {/* Left: copy */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[12px] font-medium text-ink-300 backdrop-blur"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-iris-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-iris-400" />
            </span>
            Documentation · Widget v2
          </motion.span>

          <h1 className="mt-6 text-[2.6rem] font-bold leading-[1.05] tracking-tight text-white sm:text-6xl">
            Install Scrappy AI in{" "}
            <span className="bg-gradient-to-r from-iris-300 via-iris-400 to-fuchsia-400 bg-clip-text text-transparent">
              under 2 minutes
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-ink-300 sm:text-[17px]">
            Integrate an AI-powered chatbot into any website with a single
            script tag. No build step, no dependencies, no maintenance.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <motion.a
              href="#frameworks"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-iris-500 px-6 text-[14px] font-semibold text-white shadow-glow transition-colors hover:bg-iris-400"
            >
              <Terminal size={16} strokeWidth={2.2} />
              Get Installation Script
              <ArrowRight
                size={16}
                strokeWidth={2.2}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </motion.a>
            <motion.a
              href="#flow"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-6 text-[14px] font-semibold text-ink-100 backdrop-blur transition-colors hover:bg-white/[0.07]"
            >
              <BookOpen size={16} strokeWidth={2.2} />
              View Documentation
            </motion.a>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-[12.5px] text-ink-400">
            <span>✓ Works with every framework</span>
            <span>✓ RAG-powered answers</span>
            <span>✓ No coding required</span>
          </div>
        </motion.div>

        {/* Right: animated glassmorphic code editor */}
        <motion.div
          initial={{ opacity: 0, y: 30, rotateX: 8 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ delay: 0.15, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative [perspective:1200px]"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="relative rounded-2xl bg-gradient-to-b from-iris-400/40 via-white/10 to-transparent p-px shadow-[0_40px_120px_-30px_rgba(99,102,241,0.55)]"
          >
            <div className="overflow-hidden rounded-[15px] border border-white/5 bg-[#0B0B12]/90 backdrop-blur-xl">
              {/* window chrome */}
              <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-[#FF5F57]" />
                  <span className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
                  <span className="h-3 w-3 rounded-full bg-[#28C840]" />
                </div>
                <span className="font-mono text-[11.5px] text-ink-400">
                  index.html
                </span>
                <span className="text-[11px] font-medium text-iris-300">
                  HTML
                </span>
              </div>
              {/* code body with animated line reveal + blinking caret */}
              <div className="px-5 py-5 font-mono text-[12.5px] leading-[1.85]">
                {codeLines.map((line, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.12, duration: 0.4 }}
                    className="flex gap-4"
                  >
                    <span className="w-4 select-none text-right text-ink-600">
                      {i + 1}
                    </span>
                    <span className="whitespace-pre text-ink-100">
                      {highlight(line || " ", "html")}
                      {i === codeLines.length - 1 && (
                        <span className="ml-0.5 inline-block h-[1.05em] w-[7px] translate-y-[2px] bg-iris-400 animate-caret-blink" />
                      )}
                    </span>
                  </motion.div>
                ))}
              </div>
              {/* status bar */}
              <div className="flex items-center justify-between border-t border-white/[0.06] px-5 py-2.5 text-[11px] text-ink-500">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Ready to paste
                </span>
                <span>UTF-8 · LF</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
