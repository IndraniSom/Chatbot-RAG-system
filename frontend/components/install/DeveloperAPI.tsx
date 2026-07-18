"use client";

import { CodeBlock } from "./CodeBlock";
import { SectionHeader } from "./SectionHeader";
import { Reveal } from "./Reveal";

const requestCode = `POST /api/chat HTTP/1.1
Host: api.scrappy.ai
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "website_id": "YOUR_WEBSITE_ID",
  "message": "What are your business hours?",
  "session_id": "sess_9f2c14",
  "stream": false
}`;

const responseCode = `{
  "id": "msg_7Kd83nQ",
  "role": "assistant",
  "message": "We're open Monday to Friday, 9am–6pm EST.",
  "sources": [
    { "title": "Contact", "url": "https://yoursite.com/contact" }
  ],
  "usage": { "prompt_tokens": 412, "completion_tokens": 24 },
  "session_id": "sess_9f2c14"
}`;

export function DeveloperAPI() {
  return (
    <section id="api" className="mx-auto max-w-6xl px-6 py-24 sm:py-28">
      <SectionHeader
        eyebrow="Developer API"
        title="Talk to your assistant programmatically"
        description="Prefer to build your own UI? Send messages directly to the chat endpoint and stream RAG-grounded answers."
      />

      <Reveal className="mt-10" delay={0.05}>
        <div className="mb-5 inline-flex items-center gap-2.5 rounded-lg border border-white/10 bg-white/[0.03] px-3.5 py-2 font-mono text-[13px]">
          <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-emerald-300">
            POST
          </span>
          <span className="text-ink-200">/api/chat</span>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <p className="mb-3 text-[13px] font-semibold uppercase tracking-wider text-ink-400">
              Request
            </p>
            <CodeBlock code={requestCode} lang="json" filename="request.http" />
          </div>
          <div>
            <p className="mb-3 text-[13px] font-semibold uppercase tracking-wider text-ink-400">
              Response
            </p>
            <CodeBlock code={responseCode} lang="json" filename="200 OK" />
          </div>
        </div>
      </Reveal>
    </section>
  );
}
