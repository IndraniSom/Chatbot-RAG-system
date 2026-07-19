"use client";

import { Zap, Globe, Brain, MousePointerClick } from "lucide-react";
import { RevealGroup, RevealItem } from "./Reveal";

const features = [
  {
    icon: Zap,
    title: "Lightning Fast",
    body: "Install using one script tag. The widget loads asynchronously and never blocks your page.",
  },
  {
    icon: Globe,
    title: "Works Everywhere",
    body: "Compatible with every framework — React, Vue, Angular, WordPress, Shopify and plain HTML.",
  },
  {
    icon: Brain,
    title: "AI Powered",
    body: "A website-aware chatbot powered by RAG. It reads your content and answers with real context.",
  },
  {
    icon: MousePointerClick,
    title: "Easy Setup",
    body: "No coding required after installation. Configure everything visually from your dashboard.",
  },
];

export function Features() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24 sm:py-28">
      <RevealGroup className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f) => (
          <RevealItem key={f.title}>
            <article className="group relative h-full overflow-hidden rounded-[1.35rem] border border-ink-900/10 bg-white/80 p-6 shadow-[0_18px_50px_-34px_rgba(10,10,11,0.45)] transition-all duration-300 hover:-translate-y-1 hover:border-iris-500/30 hover:bg-white">
              {/* hover glow */}
              <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-iris-500/0 blur-2xl transition-all duration-500 group-hover:bg-iris-500/10" />
              <div className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-iris-500/15 bg-iris-50 text-iris-700 transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-110">
                <f.icon size={20} strokeWidth={2} />
              </div>
              <h3 className="relative mt-5 text-[15.5px] font-semibold text-ink-900">
                {f.title}
              </h3>
              <p className="relative mt-2 text-[13.5px] leading-relaxed text-ink-600">
                {f.body}
              </p>
            </article>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
