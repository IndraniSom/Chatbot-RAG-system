/*!
 * Scrappy Chat Widget
 *
 * Plain-TypeScript IIFE that mounts a self-contained chat panel into a host
 * element via Shadow DOM. No frameworks, no runtime dependencies.
 *
 *   <script src="/widget.js"
 *           data-website-id="ws_abc123"
 *           data-api-url="https://api.example.com"
 *           defer></script>
 *
 * The widget asynchronously fetches per-website branding from
 * `${apiUrl}/api/widget-config/${websiteId}` and renders exactly once, so
 * the user never sees a flash of un-branded default chrome before the
 * tenant colours arrive. If the request fails, times out, or returns an
 * invalid payload, a clean default-branded widget is still rendered so the
 * embed never disappears.
 */
(() => {
  /* --------------------------------------------------------------------- */
  /*  Locate the embed <script> and read the data-attributes it was given. */
  /* --------------------------------------------------------------------- */

  const script = document.querySelector<HTMLScriptElement>(
    "script[data-website-id]"
  );

  if (!script) {
    console.error(
      "[Scrappy] Could not find an embed <script data-website-id=…>."
    );
    return;
  }

  const websiteId = script.dataset.websiteId?.trim();

  // The dashboard's install snippet sets `data-api-url` to wherever the
  // widget's backend lives. Fall back to same-origin (works when the
  // widget is served from the same host as the API) → and finally the
  // developer-friendly localhost default.
  const apiUrl =
    script.dataset.apiUrl?.trim() ||
    (typeof window !== "undefined" ? window.location.origin : "") ||
    "http://localhost:5000";

  if (!websiteId) {
    console.error(
      "[Scrappy] data-website-id is required on the embed script."
    );
    return;
  }

  /* -------------------------------------------------- */
  /*  Types                                            */
  /* -------------------------------------------------- */

  type Role = "user" | "assistant" | "system";

  interface ChatSource {
    title: string;
    url: string;
  }

  /**
   * Raw shape we are willing to accept from the API.
   *
   * The backend envelope is:
   *   { success: true, data: { widgetConfig: { websiteId, primaryColor, surfaceColor, logoUrl? } } }
   *
   * We tolerate missing/extra fields and never trust anything until
   * it has been explicitly validated.
   */
  interface RawWidgetConfig {
    primaryColor?: unknown;
    surfaceColor?: unknown;
    logoUrl?: unknown;
  }

  interface WidgetConfig {
    primaryColor: string;
    surfaceColor: string;
    logoUrl: string | null;
  }

  const DEFAULT_PRIMARY = "#2563EB";
  const DEFAULT_SURFACE = "#FFFFFF";

  /* -------------------------------------------------- */
  /*  Helpers                                          */
  /* -------------------------------------------------- */

  /** Accept the server's normalized six-digit hex color form only. */
  function normaliseColor(input: unknown): string | null {
    if (typeof input !== "string") return null;
    const raw = input.trim();
    return /^#[0-9a-fA-F]{6}$/.test(raw) ? raw.toUpperCase() : null;
  }

  /**
   * Picks either a near-black or near-white text colour depending on the
   * perceptual luminance of the supplied background colour. Returns a
   * sRGB hex string.
   */
  function readableForeground(hex: string): string {
    const v = hex.replace("#", "");
    const r = parseInt(v.slice(0, 2), 16) / 255;
    const g = parseInt(v.slice(2, 4), 16) / 255;
    const b = parseInt(v.slice(4, 6), 16) / 255;
    // sRGB → linear, then relative luminance.
    const lin = [r, g, b].map((c) =>
      c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    );
    const L = 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
    return L > 0.55 ? "#0A0A0B" : "#FFFFFF";
  }

  /**
   * Wraps `fetch` in an AbortController so we can enforce a short timeout
   * on the config request. The widget must not stall the page load if
   * the backend is slow.
   */
  function fetchWithTimeout(
    url: string,
    timeoutMs: number
  ): Promise<Response> {
    const controller = new AbortController();
    const t = window.setTimeout(() => controller.abort(), timeoutMs);
    return fetch(url, {
      credentials: "omit",
      signal: controller.signal,
      headers: { Accept: "application/json" },
    }).finally(() => window.clearTimeout(t));
  }

  /**
   * Extracts the `widgetConfig` payload from the backend response.
   *
   * The backend returns either:
   *
   *   { success: true, data: { widgetConfig: { websiteId, primaryColor, surfaceColor, logoUrl? } } }
   *
   * or (legacy / fallback) the config object directly. Anything else
   * returns `null` and the caller falls back to defaults.
   */
  function extractConfigPayload(json: unknown): RawWidgetConfig | null {
    if (!json || typeof json !== "object") return null;
    const root = json as Record<string, unknown>;

    // Preferred envelope: { success, data: { widgetConfig: { ... } } }
    if ("data" in root && root.data && typeof root.data === "object") {
      const data = root.data as Record<string, unknown>;
      if ("widgetConfig" in data && data.widgetConfig && typeof data.widgetConfig === "object") {
        return data.widgetConfig as RawWidgetConfig;
      }
    }

    // Flattened: { primaryColor, surfaceColor, logoUrl } at the root.
    if ("primaryColor" in root || "surfaceColor" in root || "logoUrl" in root) {
      return root as RawWidgetConfig;
    }

    return null;
  }

  /**
   * Reads the public/branding config from the backend. Returns a fully
   * validated WidgetConfig. On any failure (network, timeout, non-2xx,
   * malformed body, wrong shape) it returns the safe default widget so
   * the embed always renders something.
   */
  async function loadConfig(
    apiBase: string,
    id: string
  ): Promise<WidgetConfig> {
    const url = `${apiBase.replace(/\/+$/, "")}/api/widget-config/${encodeURIComponent(
      id
    )}`;
    try {
      const res = await fetchWithTimeout(url, 2500);
      if (!res.ok) throw new Error(`config HTTP ${res.status}`);
      const json = (await res.json()) as unknown;
      const data = extractConfigPayload(json);
      if (!data) throw new Error("widget-config: unrecognised envelope");
      return {
        primaryColor:
          normaliseColor(data.primaryColor) ?? DEFAULT_PRIMARY,
        surfaceColor:
          normaliseColor(data.surfaceColor) ?? DEFAULT_SURFACE,
        logoUrl:
          typeof data.logoUrl === "string" &&
          data.logoUrl.trim().length > 0 &&
          /^https?:\/\//i.test(data.logoUrl.trim())
            ? data.logoUrl.trim()
            : null,
      };
    } catch (err) {
      console.warn(
        "[Scrappy] widget-config unavailable, using defaults:",
        err
      );
      return {
        primaryColor: DEFAULT_PRIMARY,
        surfaceColor: DEFAULT_SURFACE,
        logoUrl: null,
      };
    }
  }

  /* -------------------------------------------------- */
  /*  Inline robot fallback (Scrappy mascot).          */
  /*  Tiny, original vector art drawn in this file —  */
  /*  no external assets, no copyright concerns.      */
  /* -------------------------------------------------- */

  /**
   * Lucide-style bot icon. Stroke-based and inline so the widget bundle
   * has no external icon dependency. We deliberately don't animate it
   * when the chat opens so the launcher stays visually stable.
   */
  const ROBOT_SVG = `
<svg viewBox="0 0 24 24" width="24" height="24"
     xmlns="http://www.w3.org/2000/svg" fill="none"
     stroke="currentColor" stroke-width="2"
     stroke-linecap="round" stroke-linejoin="round"
     aria-hidden="true" focusable="false">
  <path d="M12 8V4H8"/>
  <rect width="16" height="12" x="4" y="8" rx="2"/>
  <path d="M2 14h2"/>
  <path d="M20 14h2"/>
  <path d="M15 13v2"/>
  <path d="M9 13v2"/>
</svg>`.trim();

  /* -------------------------------------------------- */
  /*  Bootstrap the host, shadow DOM, and stylesheet.  */
  /* -------------------------------------------------- */

  const host = document.createElement("div");
  host.id = "scrappy-chat-widget";
  // Keep the host out of the a11y tree / layout until first paint is
  // ready — avoids any layout shift before the panel becomes visible.
  host.style.position = "fixed";
  host.style.right = "0";
  host.style.bottom = "0";
  host.style.width = "0";
  host.style.height = "0";
  host.style.zIndex = "2147483646";
  host.style.pointerEvents = "none";

  document.body.appendChild(host);

  const shadow = host.attachShadow({ mode: "open" });

  /**
   * The single source of UI markup. The launcher and panel are both
   * hidden-by-default via CSS; once we have a validated config we flip
   * a `data-ready` flag on the host so the launcher reveals with a soft
   * scale-in animation, so we never flash the default chrome.
   */
  shadow.innerHTML = `
<style>
  /* Zilla Slab is the chosen display + body face for the widget. The
     font files are not bundled inside this repo (the OFL-licensed
     binaries are large), so we load the stylesheet through the
     Shadow-DOM-friendly CSS @import and provide strong local
     fallbacks (Georgia, Cambria, "Times New Roman", serif) so the
     panel still reads as a slab-serif even when the CDN is
     unreachable. */
  @import url("https://fonts.googleapis.com/css2?family=Zilla+Slab:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap");

  :host {
    all: initial;
    /* The validated colors are set as inline custom properties by the
       controller before the host is revealed. */
    --scrappy-primary: #2563EB;
    --scrappy-on-primary: #FFFFFF;
    --scrappy-surface: #FFFFFF;
    --scrappy-on-surface: #0A0A0B;
    --scrappy-surface-soft: #EDEDEF;
    --scrappy-border: rgba(10, 10, 11, 0.08);
    --scrappy-shadow: 0 18px 48px -12px rgba(10, 10, 11, 0.28),
                      0 4px 12px rgba(10, 10, 11, 0.08);
    --scrappy-radius: 18px;
    --scrappy-radius-sm: 10px;

    font-family: "Zilla Slab", Georgia, Cambria, "Times New Roman", serif;
    color: var(--scrappy-on-surface);
    font-size: 15px;
    line-height: 1.5;
    font-feature-settings: "ss01", "kern";
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
  }

  *, *::before, *::after { box-sizing: border-box; }

  button, input, textarea {
    font: inherit;
    color: inherit;
  }

  /* The launcher button: a tactile, slightly off-axis disc that
     reveals only after the host flips data-ready. */
  .scrappy-launcher {
    position: fixed;
    right: 22px;
    bottom: 22px;
    width: 60px;
    height: 60px;
    border: none;
    border-radius: 50%;
    background: var(--scrappy-primary);
    color: var(--scrappy-on-primary);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: var(--scrappy-shadow);
    pointer-events: auto;
    transition:
      transform 200ms cubic-bezier(.2,.7,.2,1.1),
      box-shadow 200ms ease,
      background 200ms ease;
    outline: none;
  }
  .scrappy-launcher:hover { transform: translateY(-1px) scale(1.03); }
  .scrappy-launcher:active { transform: translateY(0) scale(0.97); }
  .scrappy-launcher:focus-visible {
    box-shadow:
      0 0 0 3px color-mix(in srgb, var(--scrappy-primary) 45%, transparent),
      var(--scrappy-shadow);
  }
  .scrappy-launcher .glyph {
    width: 30px; height: 30px;
    display: inline-block;
    transition: transform 220ms ease, opacity 220ms ease;
  }
  .scrappy-launcher .glyph svg { width: 100%; height: 100%; display: block; }

  .scrappy-invite {
    position: fixed;
    right: 22px;
    bottom: 94px;
    min-width: max-content;
    border: 1px solid var(--scrappy-border);
    border-radius: 13px 13px 4px 13px;
    background: var(--scrappy-surface);
    color: var(--scrappy-on-surface);
    padding: 9px 13px 8px;
    box-shadow: 0 12px 34px -18px rgba(10, 10, 11, 0.45);
    pointer-events: auto;
    cursor: pointer;
    opacity: 0;
    transform: translateX(8px) scale(0.97);
    transform-origin: bottom right;
    transition: opacity 220ms ease, transform 220ms cubic-bezier(.2,.7,.2,1.1);
  }
  :host([data-ready="true"]) .scrappy-invite {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
  :host([data-open="true"]) .scrappy-invite { display: none; }
  .scrappy-invite strong {
    display: block;
    font-size: 14px;
    font-weight: 600;
    line-height: 1.05;
  }
  .scrappy-invite span {
    display: block;
    margin-top: 3px;
    font-size: 10px;
    font-style: italic;
    opacity: 0.62;
  }
  .scrappy-invite:hover { transform: translateX(-2px) scale(1.01); }
  .scrappy-invite:focus-visible {
    outline: 2px solid var(--scrappy-primary);
    outline-offset: 3px;
  }

  /* The panel: a deliberately asymmetric, layered card. */
  .scrappy-panel {
    position: fixed;
    right: 22px;
    bottom: 96px;
    width: min(380px, calc(100vw - 28px));
    height: min(560px, calc(100vh - 120px));
    background: var(--scrappy-surface);
    color: var(--scrappy-on-surface);
    border: 1px solid var(--scrappy-border);
    border-radius: var(--scrappy-radius);
    box-shadow: var(--scrappy-shadow);
    display: none;
    flex-direction: column;
    overflow: hidden;
    pointer-events: auto;
    transform-origin: bottom right;
    transform: translateY(8px) scale(0.985);
    opacity: 0;
    transition:
      transform 220ms cubic-bezier(.2,.7,.2,1.05),
      opacity 180ms ease;
  }
  .scrappy-panel.open {
    display: flex;
    transform: translateY(0) scale(1);
    opacity: 1;
  }

  /* Header — full-bleed primary band with a hairline border below. */
  .scrappy-header {
    background: var(--scrappy-primary);
    color: var(--scrappy-on-primary);
    padding: 14px 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    border-bottom: 1px solid color-mix(in srgb, var(--scrappy-on-primary) 14%, transparent);
  }
  .scrappy-header .logo {
    width: 32px; height: 32px;
    border-radius: 8px;
    background: color-mix(in srgb, var(--scrappy-on-primary) 14%, transparent);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--scrappy-on-primary);
    overflow: hidden;
  }
  .scrappy-header .logo img {
    width: 100%; height: 100%; object-fit: cover; display: block;
  }
  .scrappy-header .logo svg { width: 22px; height: 22px; display: block; }
  .scrappy-header .meta { flex: 1; min-width: 0; }
  .scrappy-header .title {
    font-weight: 600;
    font-size: 16px;
    letter-spacing: -0.005em;
    line-height: 1.2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .scrappy-header .subtitle {
    font-size: 12px;
    opacity: 0.78;
    margin-top: 2px;
    font-style: italic;
  }
  .scrappy-header .close {
    width: 32px; height: 32px;
    border: none;
    background: transparent;
    color: var(--scrappy-on-primary);
    border-radius: 8px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: background 160ms ease;
  }
  .scrappy-header .close:hover {
    background: color-mix(in srgb, var(--scrappy-on-primary) 14%, transparent);
  }
  .scrappy-header .close:focus-visible {
    outline: 2px solid var(--scrappy-on-primary);
    outline-offset: 2px;
  }
  .scrappy-header .close svg { width: 18px; height: 18px; }

  /* Message scroll area. The faint "paper" texture is generated
     entirely from CSS so the file stays self-contained. */
  .scrappy-log {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 16px 14px 8px;
    background:
      radial-gradient(circle at 1px 1px,
        color-mix(in srgb, var(--scrappy-on-surface) 6%, transparent) 1px,
        transparent 0) 0 0 / 18px 18px,
      var(--scrappy-surface);
    scrollbar-width: thin;
    scrollbar-color: color-mix(in srgb, var(--scrappy-on-surface) 22%, transparent) transparent;
  }
  .scrappy-log::-webkit-scrollbar { width: 6px; }
  .scrappy-log::-webkit-scrollbar-thumb {
    background: color-mix(in srgb, var(--scrappy-on-surface) 22%, transparent);
    border-radius: 3px;
  }

  .scrappy-bubble {
    max-width: 84%;
    padding: 10px 13px;
    border-radius: 14px;
    margin: 0 0 10px;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    word-break: break-word;
    font-size: 14.5px;
    line-height: 1.45;
    border: 1px solid var(--scrappy-border);
  }
  .scrappy-bubble.assistant {
    background: #FFFFFF;
    color: var(--scrappy-on-surface);
    border-top-left-radius: 4px;
  }
  .scrappy-bubble.user {
    background: var(--scrappy-primary);
    color: var(--scrappy-on-primary);
    border-color: color-mix(in srgb, var(--scrappy-on-primary) 18%, transparent);
    margin-left: auto;
    border-top-right-radius: 4px;
  }
  .scrappy-bubble.error {
    background: color-mix(in srgb, #b42318 8%, var(--scrappy-surface));
    border-color: color-mix(in srgb, #b42318 30%, transparent);
    color: #7a1a12;
    border-top-left-radius: 4px;
  }

  .scrappy-answer-group {
    max-width: 88%;
    margin: 0 0 10px;
  }
  .scrappy-answer-group .scrappy-bubble {
    max-width: 100%;
    margin-bottom: 0;
  }
  .scrappy-sources {
    margin: 7px 0 0 9px;
    padding-left: 12px;
    border-left: 1px solid color-mix(in srgb, var(--scrappy-primary) 28%, transparent);
  }
  .scrappy-sources-label {
    display: block;
    margin-bottom: 5px;
    color: color-mix(in srgb, var(--scrappy-on-surface) 62%, transparent);
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }
  .scrappy-source-list {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .scrappy-source-link {
    display: inline-flex;
    max-width: 210px;
    align-items: center;
    gap: 5px;
    border: 1px solid var(--scrappy-border);
    border-radius: 999px;
    background: color-mix(in srgb, var(--scrappy-primary) 7%, var(--scrappy-surface));
    color: var(--scrappy-on-surface);
    padding: 4px 8px;
    font-size: 11px;
    line-height: 1.15;
    text-decoration: none;
    transition: border-color 150ms ease, background 150ms ease, transform 150ms ease;
  }
  .scrappy-source-link span {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .scrappy-source-link svg {
    width: 10px;
    height: 10px;
    flex: 0 0 auto;
  }
  .scrappy-source-link:hover {
    border-color: color-mix(in srgb, var(--scrappy-primary) 38%, transparent);
    background: color-mix(in srgb, var(--scrappy-primary) 12%, var(--scrappy-surface));
    transform: translateY(-1px);
  }
  .scrappy-source-link:focus-visible {
    outline: 2px solid var(--scrappy-primary);
    outline-offset: 2px;
  }

  /* Thinking dots: 3 staggered dots. Static when the user prefers
     reduced motion; a gentle bounce otherwise. */
  .scrappy-thinking {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 4px 2px;
  }
  .scrappy-thinking .dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: color-mix(in srgb, var(--scrappy-on-surface) 55%, transparent);
    display: inline-block;
  }
  @media (prefers-reduced-motion: no-preference) {
    .scrappy-thinking .dot {
      animation: scrappy-bounce 1.05s ease-in-out infinite;
    }
    .scrappy-thinking .dot:nth-child(2) { animation-delay: 140ms; }
    .scrappy-thinking .dot:nth-child(3) { animation-delay: 280ms; }
  }
  @keyframes scrappy-bounce {
    0%, 80%, 100% { transform: translateY(0); opacity: 0.55; }
    40%           { transform: translateY(-4px); opacity: 1; }
  }

  /* Composer */
  .scrappy-composer {
    display: flex;
    gap: 8px;
    padding: 10px 12px 12px;
    border-top: 1px solid var(--scrappy-border);
    background: var(--scrappy-surface);
  }
  .scrappy-composer input {
    flex: 1;
    min-width: 0;
    padding: 10px 12px;
    border: 1px solid var(--scrappy-border);
    border-radius: var(--scrappy-radius-sm);
    background: #FFFFFF;
    color: var(--scrappy-on-surface);
    outline: none;
    transition: border-color 140ms ease, box-shadow 140ms ease;
  }
  .scrappy-composer input::placeholder { color: color-mix(in srgb, var(--scrappy-on-surface) 45%, transparent); font-style: italic; }
  .scrappy-composer input:focus {
    border-color: color-mix(in srgb, var(--scrappy-primary) 55%, transparent);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--scrappy-primary) 18%, transparent);
  }
  .scrappy-composer input:disabled { opacity: 0.6; cursor: not-allowed; }

  .scrappy-send {
    padding: 0 16px;
    border: none;
    border-radius: var(--scrappy-radius-sm);
    background: var(--scrappy-primary);
    color: var(--scrappy-on-primary);
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-weight: 600;
    letter-spacing: 0.01em;
    transition: transform 120ms ease, opacity 160ms ease, background 160ms ease;
  }
  .scrappy-send:hover  { transform: translateY(-1px); }
  .scrappy-send:active { transform: translateY(0) scale(0.98); }
  .scrappy-send:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
  .scrappy-send:focus-visible {
    outline: 2px solid var(--scrappy-on-primary);
    outline-offset: 2px;
  }
  .scrappy-send .arrow { width: 14px; height: 14px; display: inline-block; }

  /* Reduced motion: kill the panel transition entirely. */
  @media (prefers-reduced-motion: reduce) {
    .scrappy-panel, .scrappy-launcher, .scrappy-invite, .scrappy-send {
      transition: none !important;
    }
    .scrappy-thinking .dot {
      animation: none !important;
      opacity: 0.7;
    }
  }

  /* Small viewports: full-bleed, no offset. */
  @media (max-width: 480px) {
    .scrappy-panel {
      right: 0;
      bottom: 0;
      width: 100vw;
      height: 100dvh;
      max-height: 100dvh;
      border-radius: 0;
      border: none;
    }
    .scrappy-launcher {
      right: 16px;
      bottom: 16px;
    }
    .scrappy-invite {
      right: 16px;
      bottom: 88px;
    }
  }
</style>

<button
  class="scrappy-invite"
  type="button"
  aria-label="Open chat — hey, let's talk"
>
  <strong>Hey, let’s talk</strong>
  <span>Ask me anything</span>
</button>

<button
  class="scrappy-launcher"
  type="button"
  aria-label="Open Scrappy chat"
  aria-expanded="false"
  aria-controls="scrappy-panel"
>
  <span class="glyph" data-glyph="open">${ROBOT_SVG}</span>
</button>

<section
  class="scrappy-panel"
  id="scrappy-panel"
  role="dialog"
  aria-modal="false"
  aria-labelledby="scrappy-title"
  aria-describedby="scrappy-subtitle"
  tabindex="-1"
>
  <header class="scrappy-header">
    <span class="logo" data-logo></span>
    <div class="meta">
      <div class="title" id="scrappy-title">Scrappy</div>
      <div class="subtitle" id="scrappy-subtitle">Ask anything about this site</div>
    </div>
    <button class="close" type="button" aria-label="Close chat">
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
        <path d="M5 5l10 10M15 5L5 15"/>
      </svg>
    </button>
  </header>

  <div class="scrappy-log" role="log" aria-live="polite" aria-busy="false"></div>

  <form class="scrappy-composer" novalidate>
    <input
      class="scrappy-input"
      type="text"
      autocomplete="off"
      spellcheck="true"
      placeholder="Ask a question…"
      aria-label="Message Scrappy"
    />
    <button class="scrappy-send" type="submit" aria-label="Send message">
      <span>Send</span>
      <svg class="arrow" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M3 8h10M9 4l4 4-4 4"/>
      </svg>
    </button>
  </form>
</section>
`;

  /* -------------------------------------------------- */
  /*  Element references                                */
  /* -------------------------------------------------- */

  const invite = shadow.querySelector<HTMLButtonElement>(
    ".scrappy-invite"
  )!;
  const launcher = shadow.querySelector<HTMLButtonElement>(
    ".scrappy-launcher"
  )!;
  const panel = shadow.querySelector<HTMLElement>(".scrappy-panel")!;
  const closeBtn = shadow.querySelector<HTMLButtonElement>(
    ".scrappy-header .close"
  )!;
  const logoSlot = shadow.querySelector<HTMLElement>("[data-logo]")!;
  const log = shadow.querySelector<HTMLElement>(".scrappy-log")!;
  const form = shadow.querySelector<HTMLFormElement>(".scrappy-composer")!;
  const input = shadow.querySelector<HTMLInputElement>(".scrappy-input")!;
  const sendBtn = shadow.querySelector<HTMLButtonElement>(".scrappy-send")!;

  /* -------------------------------------------------- */
  /*  Render loop helpers                              */
  /* -------------------------------------------------- */

  function setLogo(url: string | null) {
    logoSlot.replaceChildren();
    if (url) {
      const img = document.createElement("img");
      img.src = url;
      img.alt = "";
      img.referrerPolicy = "no-referrer";
      img.decoding = "async";
      img.addEventListener(
        "error",
        () => {
          logoSlot.replaceChildren();
          renderFallbackLogo();
        },
        { once: true }
      );
      logoSlot.appendChild(img);
    } else {
      renderFallbackLogo();
    }
  }

  function renderFallbackLogo() {
    const wrap = document.createElement("span");
    wrap.style.display = "inline-flex";
    wrap.style.alignItems = "center";
    wrap.style.justifyContent = "center";
    wrap.style.width = "100%";
    wrap.style.height = "100%";
    wrap.innerHTML = ROBOT_SVG;
    logoSlot.appendChild(wrap);
  }

  function appendMessage(
    role: Role,
    text: string,
    opts: { variant?: "error" } = {}
  ): HTMLDivElement {
    const el = document.createElement("div");
    el.className =
      "scrappy-bubble " +
      (opts.variant === "error" ? "error" : role);
    // textContent is safe-by-construction: no HTML parsing.
    el.textContent = text;
    log.appendChild(el);
    log.scrollTop = log.scrollHeight;
    return el;
  }

  function normaliseSources(input: unknown): ChatSource[] {
    if (!Array.isArray(input)) return [];

    const seen = new Set<string>();
    const sources: ChatSource[] = [];

    for (const candidate of input) {
      if (!candidate || typeof candidate !== "object") continue;
      const raw = candidate as Record<string, unknown>;
      if (typeof raw.url !== "string") continue;

      let parsed: URL;
      try {
        parsed = new URL(raw.url);
      } catch {
        continue;
      }
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") continue;

      const url = parsed.toString();
      if (seen.has(url)) continue;
      seen.add(url);

      const title =
        typeof raw.title === "string" && raw.title.trim()
          ? raw.title.trim()
          : parsed.pathname.split("/").filter(Boolean).pop() || parsed.hostname;

      sources.push({ title, url });
      if (sources.length === 4) break;
    }

    return sources;
  }

  function appendAssistantAnswer(
    text: string,
    sources: ChatSource[]
  ): HTMLDivElement {
    if (sources.length === 0) return appendMessage("assistant", text);

    const group = document.createElement("div");
    group.className = "scrappy-answer-group";

    const bubble = document.createElement("div");
    bubble.className = "scrappy-bubble assistant";
    bubble.textContent = text;
    group.appendChild(bubble);

    const sourceRegion = document.createElement("div");
    sourceRegion.className = "scrappy-sources";
    sourceRegion.setAttribute("aria-label", "Sources for this answer");

    const label = document.createElement("span");
    label.className = "scrappy-sources-label";
    label.textContent = sources.length === 1 ? "Source" : "Sources";
    sourceRegion.appendChild(label);

    const list = document.createElement("ul");
    list.className = "scrappy-source-list";

    for (const source of sources) {
      const item = document.createElement("li");
      const link = document.createElement("a");
      link.className = "scrappy-source-link";
      link.href = source.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.referrerPolicy = "no-referrer";
      link.title = source.url;
      link.setAttribute("aria-label", `Open source: ${source.title}`);

      const title = document.createElement("span");
      title.textContent = source.title;
      link.appendChild(title);

      const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      icon.setAttribute("viewBox", "0 0 12 12");
      icon.setAttribute("fill", "none");
      icon.setAttribute("stroke", "currentColor");
      icon.setAttribute("stroke-width", "1.3");
      icon.setAttribute("stroke-linecap", "round");
      icon.setAttribute("stroke-linejoin", "round");
      icon.setAttribute("aria-hidden", "true");
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", "M4.5 2H2.8A.8.8 0 0 0 2 2.8v6.4c0 .44.36.8.8.8h6.4a.8.8 0 0 0 .8-.8V7.5M7 2h3v3M5.5 6.5 10 2");
      icon.appendChild(path);
      link.appendChild(icon);

      item.appendChild(link);
      list.appendChild(item);
    }

    sourceRegion.appendChild(list);
    group.appendChild(sourceRegion);
    log.appendChild(group);
    log.scrollTop = log.scrollHeight;
    return group;
  }

  function appendThinkingBubble(): HTMLDivElement {
    const el = document.createElement("div");
    el.className = "scrappy-bubble assistant scrappy-thinking-wrap";
    el.setAttribute("data-thinking", "true");
    // Visually present a "Scrappy is thinking" status to assistive tech.
    el.setAttribute("role", "status");
    el.setAttribute("aria-live", "polite");

    const inner = document.createElement("span");
    inner.className = "scrappy-thinking";
    inner.setAttribute("aria-hidden", "true");
    for (let i = 0; i < 3; i++) {
      const dot = document.createElement("span");
      dot.className = "dot";
      inner.appendChild(dot);
    }

    const sr = document.createElement("span");
    sr.className = "scrappy-sr";
    sr.style.position = "absolute";
    sr.style.width = "1px";
    sr.style.height = "1px";
    sr.style.padding = "0";
    sr.style.margin = "-1px";
    sr.style.overflow = "hidden";
    sr.style.clip = "rect(0 0 0 0)";
    sr.style.whiteSpace = "nowrap";
    sr.style.border = "0";
    sr.textContent = "Scrappy is thinking";

    el.appendChild(inner);
    el.appendChild(sr);
    log.appendChild(el);
    log.scrollTop = log.scrollHeight;
    return el;
  }

  /* -------------------------------------------------- */
  /*  Pending lifecycle                                 */
  /* -------------------------------------------------- */

  let isPending = false;
  let thinkingEl: HTMLDivElement | null = null;
  let inflight: AbortController | null = null;

  function setPending(next: boolean) {
    isPending = next;
    input.disabled = next;
    sendBtn.disabled = next;
    form.setAttribute("aria-busy", next ? "true" : "false");
    log.setAttribute("aria-busy", next ? "true" : "false");
  }

  /* -------------------------------------------------- */
  /*  Open / close                                     */
  /* -------------------------------------------------- */

  function openPanel() {
    if (panel.classList.contains("open")) return;
    panel.classList.add("open");
    host.dataset.open = "true";
    launcher.setAttribute("aria-expanded", "true");
    // Allow the transition to start, then focus the composer input.
    requestAnimationFrame(() => input.focus());
  }

  function closePanel() {
    if (!panel.classList.contains("open")) return;
    panel.classList.remove("open");
    delete host.dataset.open;
    launcher.setAttribute("aria-expanded", "false");
    launcher.focus();
  }

  invite.addEventListener("click", openPanel);
  launcher.addEventListener("click", () => {
    if (panel.classList.contains("open")) closePanel();
    else openPanel();
  });
  closeBtn.addEventListener("click", closePanel);
  panel.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      closePanel();
    }
  });
  // Clicking outside the panel closes it (but not while a fetch is in
  // flight — a stray click during a long request would be jarring).
  document.addEventListener("click", (e) => {
    if (!panel.classList.contains("open")) return;
    const path = e.composedPath();
    if (path.includes(panel) || path.includes(launcher) || path.includes(invite)) return;
    closePanel();
  });

  /* -------------------------------------------------- */
  /*  Greeting                                         */
  /* -------------------------------------------------- */

  appendMessage(
    "assistant",
    "Hi there. Ask me anything about this site and I will dig through the knowledge base for you."
  );

  /* -------------------------------------------------- */
  /*  Submit                                           */
  /* -------------------------------------------------- */

  async function handleSubmit() {
    if (isPending) return;
    const text = input.value.trim();
    if (!text) return;

    appendMessage("user", text);
    input.value = "";

    // Immediately render exactly one thinking bubble and disable the
    // composer for the entire fetch/JSON duration.
    setPending(true);
    thinkingEl = appendThinkingBubble();

    inflight = new AbortController();
    const timeoutId = window.setTimeout(
      () => inflight?.abort(),
      25_000
    );

    try {
      const res = await fetch(`${apiUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "omit",
        signal: inflight.signal,
        body: JSON.stringify({ websiteId, message: text }),
      });
      if (!res.ok) throw new Error(`chat HTTP ${res.status}`);
      const json = (await res.json()) as {
        data?: { answer?: unknown; sources?: unknown };
      };
      const answer = json?.data?.answer;
      if (typeof answer !== "string" || answer.length === 0) {
        throw new Error("Invalid chatbot response");
      }
      const sources = normaliseSources(json?.data?.sources);
      replaceThinking(appendAssistantAnswer(answer, sources));
    } catch (err) {
      console.error("[Scrappy]", err);
      replaceThinking(
        appendMessage(
          "assistant",
          "I couldn't reach the knowledge base just now. Please try again in a moment.",
          { variant: "error" }
        )
      );
    } finally {
      window.clearTimeout(timeoutId);
      inflight = null;
      thinkingEl = null;
      setPending(false);
      input.focus();
    }
  }

  function replaceThinking(replacement: HTMLElement | null) {
    if (thinkingEl && thinkingEl.parentNode === log) {
      if (replacement) {
        log.replaceChild(replacement, thinkingEl);
      } else {
        log.removeChild(thinkingEl);
      }
    } else if (replacement) {
      log.appendChild(replacement);
    }
    thinkingEl = null;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    handleSubmit();
  });

  // The original widget used `keydown` to send on Enter; we keep that
  // ergonomic but also ignore modifier-combos so Cmd/Ctrl+Enter
  // behaves predictably.
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey && !e.isComposing) {
      e.preventDefault();
      handleSubmit();
    }
  });

  /* -------------------------------------------------- */
  /*  Async config bootstrap + first paint             */
  /* -------------------------------------------------- */

  (async () => {
    const cfg = await loadConfig(apiUrl, websiteId);

    // Strict validation already happens inside loadConfig; this only
    // applies the validated values as CSS custom properties and sets
    // up the logo. We do not re-render the markup — the panel is
    // already on the page and the validated values cascade in via the
    // host custom properties.
    const onPrimary = readableForeground(cfg.primaryColor);
    const onSurface = readableForeground(cfg.surfaceColor);

    host.style.setProperty("--scrappy-primary", cfg.primaryColor);
    host.style.setProperty("--scrappy-on-primary", onPrimary);
    host.style.setProperty("--scrappy-surface", cfg.surfaceColor);
    host.style.setProperty(
      "--scrappy-on-surface",
      onSurface === "#FFFFFF" ? "#0A0A0B" : onSurface
    );
    host.style.setProperty(
      "--scrappy-surface-soft",
      `color-mix(in srgb, ${cfg.surfaceColor} 80%, #FFFFFF)`
    );

    // Re-skin the thinking dot colour against the resolved surface.
    shadow.querySelectorAll<HTMLElement>(".scrappy-thinking .dot").forEach(
      (d) => {
        d.style.background = `color-mix(in srgb, ${onSurface === "#FFFFFF" ? "#0A0A0B" : "#FFFFFF"} 55%, transparent)`;
      }
    );

    setLogo(cfg.logoUrl);

    // Reveal the launcher exactly once.
    host.dataset.ready = "true";
    launcher.style.opacity = "1";
  })();

  console.log(`[Scrappy] Widget loaded for ${websiteId}`);
})();
