import type { SuggestedQuestion } from "../types";

/**
 * Dummy assistant replies keyed by simple intent detection so a demo conversation
 * feels real. Falls back to a randomized general answer set.
 */
const RESPONSES: Record<string, string> = {
  contact:
    "You can reach our support team 24/7 at **hello@scrappy.ai** or use the live chat right here. Most replies arrive within a few minutes.",
  pricing:
    "Scrappy AI has three plans:\n\n- **Free** — up to 1,000 messages/mo\n- **Team** — $29/mo, 25 seats, priority routing\n- **Enterprise** — custom volumes, SSO, dedicated CSM\n\nWant me to walk you through which one fits?",
  pricing_plans:
    "Scrappy AI has three plans:\n\n- **Free** — up to 1,000 messages/mo\n- **Team** — $29/mo, 25 seats, priority routing\n- **Enterprise** — custom volumes, SSO, dedicated CSM",
  password:
    "To reset your password:\n\n1. Go to **Settings → Security**\n2. Click *Forgot password*\n3. Check your inbox for a reset link (valid for 30 min)\n\nIf the email doesn't arrive, check spam or message me again.",
  reset_password:
    "To reset your password:\n\n1. Go to **Settings → Security**\n2. Click *Forgot password*\n3. Check your inbox for a reset link (valid for 30 min)",
  docs:
    "Our documentation lives at [docs.scrappy.ai](https://docs.scrappy.ai). The quickstart guide gets you from zero to first message in under 5 minutes.",
  documentation:
    "Our documentation lives at [docs.scrappy.ai](https://docs.scrappy.ai). The quickstart guide gets you from zero to first message in under 5 minutes.",
  refund:
    "Refunds are available within **14 days** of purchase, no questions asked. Just reply to your invoice email or message me here and I'll handle it personally.",
  refunds:
    "Refunds are available within **14 days** of purchase, no questions asked. Just reply to your invoice email or message me here and I'll handle it personally.",
  services:
    "We build *calm intelligence* — AI chat agents that ship in an afternoon, train on your docs in minutes, and never sound like a chatbot. Three product lines: **Assist**, **Copilot**, and **Embed**.",
  who:
    "I'm Scrappy AI — your website's reader. I was trained on this site's content and a small dose of good manners. Ask me anything, and if I don't know, I'll say so rather than guess.",
  who_are_you:
    "I'm Scrappy AI — your website's reader. I was trained on this site's content and a small dose of good manners.",
  hello:
    "Hi there 👋 — I'm glad you stopped by. Ask me anything about this site: pricing, docs, refunds, you name it.",
  hi: "Hi there 👋 — what can I help you with today?",
};

const FALLBACKS = [
  "Good question. Based on what I know about this site, I'd say the short answer is **yes**, but the longer answer depends on your specific setup. Want me to dig deeper?",
  "Here's how I'd think about it: identify the smallest piece that delivers value this week, ship it, then iterate. If you'd like, I can sketch a concrete plan.",
  "Got it. Most teams I work with solve this in about **three steps**:\n\n1. Audit the current flow\n2. Pick one slice to automate\n3. Measure the delta after a week\n\nWhere are you in that arc right now?",
  "Happy to help. I can answer that in two ways — a quick one-liner, or a deeper walkthrough with examples. Which do you prefer?",
  "That's interesting. Tell me a bit about the *context* you're working in (team size, deadline, current tools) and I'll tailor the answer.",
];

function detectIntent(text: string): keyof typeof RESPONSES | null {
  const q = text.toLowerCase().trim();
  if (/(contact|support|email|reach|talk to (a|someone)|human)/.test(q))
    return "contact";
  if (/(pricing|price|plans?|cost|subscription)/.test(q)) return "pricing";
  if (/(reset|forgot).*password/.test(q)) return "reset_password";
  if (/(password)/.test(q)) return "password";
  if (/(docs?|documentation)/.test(q)) return "documentation";
  if (/(refund)/.test(q)) return "refunds";
  if (/(service|offer|product|feature)/.test(q)) return "services";
  if (/(who are you|what are you|tell me about yourself)/.test(q))
    return "who_are_you";
  if (/^(hi|hello|hey|yo|sup)\b/.test(q)) return q;
  return null;
}

export function pickMockReply(text: string): string {
  const intent = detectIntent(text);
  if (intent && RESPONSES[intent]) return RESPONSES[intent];
  return FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)];
}

export const SUGGESTED_QUESTIONS: SuggestedQuestion[] = [
  { id: "sq-1", text: "What services do you provide?" },
  { id: "sq-2", text: "Tell me about pricing." },
  { id: "sq-3", text: "How do refunds work?" },
  { id: "sq-4", text: "Where is your documentation?" },
  { id: "sq-5", text: "How do I contact support?" },
  { id: "sq-6", text: "Who are you?" },
];
