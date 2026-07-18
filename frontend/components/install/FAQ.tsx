"use client";

import { Reveal } from "./Reveal";
import { SectionHeader } from "./SectionHeader";
import { Accordion, type AccordionItemData } from "./Accordion";

const items: AccordionItemData[] = [
  {
    question: "How long does indexing take?",
    answer:
      "Most sites finish indexing within 2–5 minutes. Larger sites with thousands of pages can take up to 30 minutes. You'll see live progress in your dashboard and get an email when it's done.",
  },
  {
    question: "Can I use multiple websites?",
    answer:
      "Yes. Register as many websites as your plan allows — each gets its own website ID, knowledge base and analytics. Just paste the matching snippet on each site.",
  },
  {
    question: "Does Scrappy work on static websites?",
    answer:
      "Absolutely. Because it's a single script tag with no build step, Scrappy works on plain HTML, static-site generators, and any CDN-hosted page.",
  },
  {
    question: "Can I customize the widget?",
    answer:
      "Yes — colors, position, launcher icon, greeting message and tone are all configurable from the dashboard. Advanced users can override styles and behaviour via the JavaScript API.",
  },
  {
    question: "Can I remove branding?",
    answer:
      "The 'Powered by Scrappy' badge can be removed on Pro and Enterprise plans, letting you present a fully white-labeled assistant.",
  },
  {
    question: "How secure is my data?",
    answer:
      "All traffic is encrypted in transit (TLS) and at rest. We're SOC 2 Type II compliant, never train foundation models on your private content, and you can delete your data at any time.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="mx-auto max-w-4xl px-6 py-24 sm:py-28">
      <SectionHeader
        eyebrow="FAQ"
        title="Frequently asked questions"
        description="Everything else you might be wondering about."
        center
      />
      <Reveal className="mt-12" delay={0.1}>
        <Accordion items={items} />
      </Reveal>
    </section>
  );
}
