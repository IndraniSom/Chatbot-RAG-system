"use client";

import { useEffect, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { ArrowRight, BookOpen, Check, Sparkles, Terminal } from "lucide-react";

const swatches = ["#315C48", "#E2552D", "#3159D4"];

type DemoPhase = "question" | "thinking" | "answer";

export function Hero() {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const [hasMounted, setHasMounted] = useState(false);
  const reduceMotion = hasMounted && prefersReducedMotion;
  const [phase, setPhase] = useState<DemoPhase>("question");
  const [primaryColor, setPrimaryColor] = useState(swatches[0]);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const smoothX = useSpring(pointerX, { stiffness: 130, damping: 20 });
  const smoothY = useSpring(pointerY, { stiffness: 130, damping: 20 });
  const rotateY = useTransform(smoothX, [-1, 1], [-4, 4]);
  const rotateX = useTransform(smoothY, [-1, 1], [4, -4]);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!hasMounted) return;

    if (reduceMotion) {
      setPhase("answer");
      return;
    }

    const phases: DemoPhase[] = ["question", "thinking", "answer"];
    let index = 0;
    const timer = window.setInterval(() => {
      index = (index + 1) % phases.length;
      setPhase(phases[index]);
    }, 1900);

    return () => window.clearInterval(timer);
  }, [hasMounted, reduceMotion]);

  return (
    <section className="relative overflow-hidden pb-10 pt-16 sm:pb-16 sm:pt-24 lg:pt-28">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[8%] top-16 h-72 w-72 rounded-full bg-[#EFD7B8]/50 blur-[100px] motion-safe:animate-blob-drift" />
        <div className="absolute right-[4%] top-10 h-[28rem] w-[28rem] rounded-full bg-iris-200/45 blur-[120px] motion-safe:animate-blob-drift [animation-delay:-7s]" />
        <div className="absolute left-[44%] top-[26rem] h-56 w-56 rounded-full bg-emerald-100/70 blur-[90px]" />
      </div>

      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 px-6 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16">
        <motion.div
          initial={{ opacity: 0, y: reduceMotion ? 0 : 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0.01 : 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: reduceMotion ? 0 : 0.08, duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-ink-900/10 bg-white/75 px-3 py-1.5 text-[12px] font-semibold text-ink-700 shadow-sm backdrop-blur"
          >
            <Sparkles size={13} className="text-iris-700" />
            Your website, ready to talk
          </motion.span>

          <h1 className="mt-7 max-w-[12ch] text-[3.1rem] font-bold leading-[0.98] tracking-[-0.055em] text-ink-900 sm:text-[4.25rem]">
            Turn every page into a{" "}
            <span className="font-serif font-normal italic tracking-[-0.02em] text-iris-700">
              conversation.
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-[16px] leading-relaxed text-ink-600 sm:text-[17px]">
            Install a website-aware AI assistant in one line, then tune its logo
            and colors until it feels native to your brand.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <motion.a
              href="#frameworks"
              whileHover={reduceMotion ? undefined : { y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-ink-900 px-6 text-[14px] font-semibold text-white shadow-[0_20px_45px_-24px_rgba(10,10,11,0.8)] transition-colors hover:bg-ink-700"
            >
              <Terminal size={16} strokeWidth={2.2} />
              Get installation script
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </motion.a>
            <motion.a
              href="#flow"
              whileHover={reduceMotion ? undefined : { y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-ink-900/10 bg-white/70 px-6 text-[14px] font-semibold text-ink-900 backdrop-blur transition-colors hover:bg-white"
            >
              <BookOpen size={16} strokeWidth={2.2} />
              See how it works
            </motion.a>
          </div>

          <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-[12.5px] font-medium text-ink-600">
            {["Every framework", "RAG-powered", "No code after setup"].map((item) => (
              <span key={item} className="inline-flex items-center gap-1.5">
                <Check size={13} className="text-emerald-700" strokeWidth={2.6} />
                {item}
              </span>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: reduceMotion ? 0 : 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduceMotion ? 0 : 0.14, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto w-full max-w-[620px] [perspective:1200px]"
          onPointerMove={(event) => {
            if (reduceMotion) return;
            const rect = event.currentTarget.getBoundingClientRect();
            pointerX.set(((event.clientX - rect.left) / rect.width - 0.5) * 2);
            pointerY.set(((event.clientY - rect.top) / rect.height - 0.5) * 2);
          }}
          onPointerLeave={() => {
            pointerX.set(0);
            pointerY.set(0);
          }}
        >
          <div aria-hidden className="absolute -right-3 -top-5 h-full w-full rotate-3 rounded-[2rem] border border-ink-900/10 bg-[#E8D8C2]" />
          <motion.div
            style={reduceMotion ? undefined : { rotateX, rotateY, transformStyle: "preserve-3d" }}
            className="relative overflow-hidden rounded-[2rem] border border-ink-900/10 bg-white/90 p-3 shadow-[0_42px_90px_-46px_rgba(10,10,11,0.55)] backdrop-blur"
          >
            <div className="flex items-center justify-between border-b border-ink-900/10 px-3 pb-3 pt-1">
              <div className="flex gap-1.5" aria-hidden>
                <span className="h-2.5 w-2.5 rounded-full bg-[#E66A5B]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#E5AE47]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#58A76D]" />
              </div>
              <div className="rounded-full bg-[#F4F1EA] px-4 py-1.5 text-[11px] font-medium text-ink-500">
                yourwebsite.com
              </div>
              <span className="h-5 w-10" aria-hidden />
            </div>

            <div className="relative min-h-[450px] overflow-hidden rounded-[1.4rem] bg-[#F3EFE7] px-5 pb-5 pt-7 sm:min-h-[480px] sm:px-8">
              <div aria-hidden className="absolute -right-16 top-10 h-52 w-52 rounded-full border-[38px] border-white/60" />
              <p className="max-w-[12ch] font-serif text-[2rem] leading-[1.03] text-ink-900 sm:text-[2.5rem]">
                Thoughtful tools for everyday work.
              </p>
              <div className="mt-5 h-2 w-36 rounded-full bg-ink-900/10" />
              <div className="mt-2 h-2 w-48 rounded-full bg-ink-900/10" />

              <div className="absolute bottom-5 right-5 w-[min(330px,calc(100%-2.5rem))] overflow-hidden rounded-[1.45rem] border border-ink-900/10 bg-white shadow-[0_25px_60px_-30px_rgba(10,10,11,0.55)]">
                <div
                  className="flex items-center justify-between px-4 py-3 text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-white/15">
                      <BotMark />
                    </span>
                    <div>
                      <p className="font-zilla text-[14px] font-semibold leading-none">Scrappy</p>
                      <p className="mt-1 text-[9px] font-medium uppercase tracking-[0.18em] text-white/75">Online now</p>
                    </div>
                  </div>
                  <span className="h-2 w-2 rounded-full bg-emerald-300 ring-4 ring-white/10" />
                </div>

                <div className="min-h-[208px] bg-[#FBFAF7] p-4 font-zilla">
                  <div className="max-w-[82%] rounded-[14px_14px_14px_4px] border border-ink-900/10 bg-white px-3 py-2 text-[13px] leading-snug text-ink-700">
                    Hi! What would you like to know?
                  </div>
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={phase}
                      initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: reduceMotion ? 0 : -4 }}
                      transition={{ duration: reduceMotion ? 0.01 : 0.28 }}
                    >
                      <div
                        className="ml-auto mt-3 max-w-[78%] rounded-[14px_14px_4px_14px] px-3 py-2 text-[13px] leading-snug"
                        style={{ backgroundColor: primaryColor, color: readableText(primaryColor) }}
                      >
                        Do you ship internationally?
                      </div>
                      {phase === "thinking" && <ThinkingBubble />}
                      {phase === "answer" && (
                        <div className="mt-3 max-w-[86%] rounded-[14px_14px_14px_4px] border border-ink-900/10 bg-white px-3 py-2 text-[13px] leading-snug text-ink-700">
                          Yes — worldwide delivery is available, with live rates at checkout.
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="absolute -bottom-5 left-4 flex items-center gap-2 rounded-full border border-ink-900/10 bg-white px-3 py-2 shadow-lg sm:left-8">
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-500">Try a tone</span>
            {swatches.map((color) => (
              <button
                key={color}
                type="button"
                aria-label={`Preview ${color}`}
                aria-pressed={primaryColor === color}
                onClick={() => setPrimaryColor(color)}
                className="h-6 w-6 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(10,10,11,0.15)] transition-transform hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-iris-600"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function ThinkingBubble() {
  return (
    <div className="mt-3 flex w-fit items-center gap-1 rounded-[14px_14px_14px_4px] border border-ink-900/10 bg-white px-3.5 py-3" role="status">
      <span className="sr-only">Scrappy is thinking</span>
      {[0, 1, 2].map((dot) => (
        <motion.span
          key={dot}
          className="h-1.5 w-1.5 rounded-full bg-ink-400"
          animate={{ y: [0, -3, 0], opacity: [0.45, 1, 0.45] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: dot * 0.12 }}
        />
      ))}
    </div>
  );
}

function BotMark() {
  return (
    <svg viewBox="0 0 32 32" width="20" height="20" fill="none" aria-hidden>
      <circle cx="13" cy="14" r="2" fill="currentColor" />
      <circle cx="19" cy="14" r="2" fill="currentColor" />
      <path d="M11 19.5 Q16 22.5 21 19.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M16 6.5V9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="16" cy="6" r="1.2" fill="currentColor" />
    </svg>
  );
}

function readableText(hex: string) {
  const value = hex.slice(1);
  const r = Number.parseInt(value.slice(0, 2), 16);
  const g = Number.parseInt(value.slice(2, 4), 16);
  const b = Number.parseInt(value.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 155 ? "#0A0A0B" : "#FFFFFF";
}
