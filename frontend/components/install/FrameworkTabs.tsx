"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Lightbulb } from "lucide-react";
import { CodeBlock } from "./CodeBlock";
import { SectionHeader } from "./SectionHeader";
import { FRAMEWORKS } from "./frameworks";

export function FrameworkTabs() {
  const [activeId, setActiveId] = useState(FRAMEWORKS[0].id);
  const [variantIndex, setVariantIndex] = useState(0);

  const active = FRAMEWORKS.find((f) => f.id === activeId) ?? FRAMEWORKS[0];
  const variant = active.variants[variantIndex] ?? active.variants[0];

  const selectFramework = (id: string) => {
    setActiveId(id);
    setVariantIndex(0);
  };

  return (
    <section id="frameworks" className="mx-auto max-w-6xl px-6 py-24 sm:py-28">
      <SectionHeader
        eyebrow="Framework guides"
        title="Install anywhere"
        description="Pick your stack for a step-by-step guide, copy-ready code and success tips."
      />

      {/* Tab bar */}
      <div className="mt-10 flex flex-wrap gap-2">
        {FRAMEWORKS.map((f) => {
          const isActive = f.id === activeId;
          return (
            <button
              key={f.id}
              onClick={() => selectFramework(f.id)}
              className={`relative rounded-xl px-4 py-2 text-[13px] font-medium transition-colors ${
                isActive
                  ? "text-ink-900"
                  : "text-ink-500 hover:text-ink-900"
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="frameworkPill"
                  className="absolute inset-0 rounded-xl border border-iris-400/40 bg-white shadow-sm"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <span className="relative">{f.name}</span>
            </button>
          );
        })}
      </div>

      {/* Panel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 grid grid-cols-1 gap-8 rounded-2xl border border-ink-900/10 bg-white/80 p-6 shadow-[0_28px_70px_-50px_rgba(10,10,11,0.6)] sm:p-8 lg:grid-cols-2 lg:gap-10"
        >
          {/* Left: steps */}
          <div>
            {active.variants.length > 1 && (
              <div className="mb-5 inline-flex rounded-lg border border-ink-900/10 bg-[#F8F5EE] p-1">
                {active.variants.map((v, i) => (
                  <button
                    key={v.label}
                    onClick={() => setVariantIndex(i)}
                    className={`rounded-md px-3 py-1.5 text-[12.5px] font-medium transition-colors ${
                      i === variantIndex
                        ? "bg-iris-500 text-white"
                        : "text-ink-500 hover:text-ink-900"
                    }`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            )}

            <ol className="space-y-4">
              {variant.steps.map((step, i) => (
                <li key={i} className="flex gap-3.5">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-iris-400/30 bg-iris-50 text-[11.5px] font-semibold text-iris-700">
                    {i + 1}
                  </span>
                  <p className="text-[13.5px] leading-relaxed text-ink-700">
                    {step}
                  </p>
                </li>
              ))}
            </ol>

            {/* prop explanations for Next.js */}
            {active.propNotes && (
              <div className="mt-6 rounded-xl border border-ink-900/10 bg-[#F8F5EE] p-4">
                <p className="mb-3 text-[12px] font-semibold uppercase tracking-wider text-ink-500">
                  Props explained
                </p>
                <dl className="space-y-2.5">
                  {active.propNotes.map((p) => (
                    <div key={p.prop} className="flex flex-col gap-0.5">
                      <dt className="font-mono text-[12px] text-iris-700">
                        {p.prop}
                      </dt>
                      <dd className="text-[12.5px] leading-relaxed text-ink-600">
                        {p.note}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>

          {/* Right: code + tip */}
          <div className="flex flex-col gap-5">
            <CodeBlock
              key={variant.label}
              code={variant.snippet.code}
              lang={variant.snippet.lang}
              filename={variant.snippet.filename}
            />
            <div className="flex items-start gap-3 rounded-xl border border-emerald-600/15 bg-emerald-50 p-4">
              <Lightbulb
                size={17}
                strokeWidth={2}
                className="mt-0.5 shrink-0 text-emerald-700"
              />
              <p className="text-[13px] leading-relaxed text-emerald-800">
                <span className="font-semibold text-emerald-900">Tip · </span>
                {active.tip}
              </p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
