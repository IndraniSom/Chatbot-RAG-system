"use client";

import { Reveal } from "./Reveal";
import { SectionHeader } from "./SectionHeader";
import { Accordion, type AccordionItemData } from "./Accordion";

const items: AccordionItemData[] = [
  {
    question: "Chatbot not appearing",
    answer: (
      <>
        Confirm the snippet is placed before the closing{" "}
        <code className="rounded bg-iris-50 px-1.5 py-0.5 font-mono text-[12px] text-iris-700">
          &lt;/body&gt;
        </code>{" "}
        tag and that <code className="font-mono text-iris-700">data-website-id</code>{" "}
        matches the ID in your dashboard. Hard-refresh the page (Cmd/Ctrl + Shift + R)
        to clear a cached version, and check the browser console for blocked requests.
      </>
    ),
  },
  {
    question: "CORS errors",
    answer: (
      <>
        CORS errors mean your domain isn&apos;t whitelisted. Add your exact origin
        (including <code className="font-mono text-iris-700">https://</code>) under
        Website → Settings → Allowed Origins. If you run a strict Content-Security-Policy,
        allow <code className="font-mono text-iris-700">api.scrappy.ai</code> in{" "}
        <code className="font-mono text-iris-700">connect-src</code>.
      </>
    ),
  },
  {
    question: "Verification failed",
    answer:
      "The verifier couldn't detect the script on your live URL. Make sure your changes are deployed (not just saved locally), the page is publicly reachable, and there's no password / staging gate blocking our crawler. Then run Verify Installation again.",
  },
  {
    question: "Widget loads but doesn't answer",
    answer:
      "The widget is installed but your site hasn't finished indexing, or indexing returned no content. Check the indexing status in your dashboard — if it says 'No content found', ensure your pages render text server-side rather than only via client-side JavaScript.",
  },
  {
    question: "Website indexing failed",
    answer:
      "Indexing fails when our crawler can't reach your pages — common causes are robots.txt blocking, aggressive rate limiting, or auth walls. Allow the Scrappy crawler in robots.txt and confirm your sitemap URL is correct, then trigger a re-index.",
  },
  {
    question: "Rate limit errors",
    answer:
      "You've exceeded the request quota for your current plan. Rate limits reset on a rolling window — wait a minute and retry, or upgrade your plan for higher throughput. Automated traffic should use the API with an exponential-backoff retry policy.",
  },
  {
    question: "How to re-index",
    answer:
      "Open your website in the dashboard and click Re-index. Scrappy re-crawls your pages and rebuilds the knowledge base. Re-index whenever you publish major content changes so the assistant stays accurate.",
  },
];

export function Troubleshooting() {
  return (
    <section id="troubleshooting" className="mx-auto max-w-4xl px-6 py-24 sm:py-28">
      <SectionHeader
        eyebrow="Troubleshooting"
        title="Something not working?"
        description="The most common issues and how to fix them in seconds."
        center
      />
      <Reveal className="mt-12" delay={0.1}>
        <Accordion items={items} />
      </Reveal>
    </section>
  );
}
