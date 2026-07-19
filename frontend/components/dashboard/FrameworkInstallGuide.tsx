"use client";

import { useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Code2, Lightbulb, PanelsTopLeft } from "lucide-react";
import { CodeBlock } from "@/components/install/CodeBlock";
import type { Lang } from "@/components/install/highlight";

interface FrameworkInstallGuideProps {
  script: string;
}

interface ParsedScript {
  src: string;
  websiteId: string;
  apiUrl?: string;
  canonical: string;
}

interface GuideVariant {
  label: string;
  filename: string;
  lang: Lang;
  steps: string[];
  code: string;
}

interface FrameworkGuide {
  id: string;
  name: string;
  tip: string;
  variants: GuideVariant[];
}

const ATTRIBUTE_PATTERN = /\b(src|data-website-id|data-api-url)\s*=\s*(["'])(.*?)\2/gi;

/** Parse only the three attributes the generated widget tag is allowed to use. */
export function parseInstallationScript(script: string): ParsedScript | null {
  const attributes = new Map<string, string>();
  let match: RegExpExecArray | null;

  ATTRIBUTE_PATTERN.lastIndex = 0;
  while ((match = ATTRIBUTE_PATTERN.exec(script)) !== null) {
    attributes.set(match[1].toLowerCase(), match[3].trim());
  }

  const src = attributes.get("src");
  const websiteId = attributes.get("data-website-id");
  if (!src || !websiteId || !/<script\b/i.test(script)) return null;

  return {
    src,
    websiteId,
    apiUrl: attributes.get("data-api-url") || undefined,
    canonical: script.trim(),
  };
}

function scriptAttributes(config: ParsedScript, indent = "          ") {
  const apiLine = config.apiUrl
    ? `\n${indent}data-api-url=${JSON.stringify(config.apiUrl)}`
    : "";

  return `src=${JSON.stringify(config.src)}\n${indent}data-website-id=${JSON.stringify(
    config.websiteId
  )}${apiLine}`;
}

function buildGuides(config: ParsedScript): FrameworkGuide[] {
  const exactScript = config.canonical;
  const appRouter = `import Script from "next/script";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Script
          ${scriptAttributes(config)}
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}`;
  const pagesRouter = `import Script from "next/script";

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Script
        ${scriptAttributes(config, "        ")}
        strategy="afterInteractive"
      />
    </>
  );
}`;

  return [
    {
      id: "html",
      name: "HTML",
      tip: "Body-end placement lets the page render first while Scrappy loads asynchronously.",
      variants: [
        {
          label: "index.html",
          filename: "index.html",
          lang: "html",
          steps: [
            "Open your page or shared HTML template.",
            "Paste the tag immediately before the closing </body> tag.",
            "Deploy the page and return here to verify the installation.",
          ],
          code: exactScript,
        },
      ],
    },
    {
      id: "nextjs",
      name: "Next.js",
      tip: "next/script manages loading order and avoids hydration warnings for third-party widgets.",
      variants: [
        {
          label: "App Router",
          filename: "app/layout.tsx",
          lang: "jsx",
          steps: [
            "Open the root app/layout.tsx file.",
            "Import next/script and render this component inside <body>.",
            "Keep afterInteractive so the widget never blocks first paint.",
          ],
          code: appRouter,
        },
        {
          label: "Pages Router",
          filename: "pages/_app.tsx",
          lang: "jsx",
          steps: [
            "Open pages/_app.tsx.",
            "Import next/script and render it beside your page component.",
            "Deploy once so the script is available on every route.",
          ],
          code: pagesRouter,
        },
      ],
    },
    {
      id: "react",
      name: "React",
      tip: "A lifecycle hook is not required—the widget bootstraps itself from the shared HTML shell.",
      variants: [
        {
          label: "HTML shell",
          filename: "index.html",
          lang: "html",
          steps: [
            "Open the root index.html (Vite) or public/index.html (CRA).",
            "Paste the generated tag before </body>.",
            "One shared tag makes the assistant available across app routes.",
          ],
          code: exactScript,
        },
      ],
    },
    {
      id: "vue",
      name: "Vue",
      tip: "The root HTML shell is the cleanest integration and survives component remounts.",
      variants: [
        {
          label: "index.html",
          filename: "index.html",
          lang: "html",
          steps: [
            "Open index.html at the project root.",
            "Place the generated tag directly before </body>.",
            "Build and deploy your Vue application.",
          ],
          code: exactScript,
        },
      ],
    },
    {
      id: "wordpress",
      name: "WordPress",
      tip: "A footer-code plugin is safest because the installation survives theme updates.",
      variants: [
        {
          label: "WPCode plugin",
          filename: "Footer / Body-end snippet",
          lang: "html",
          steps: [
            "Install WPCode or another headers-and-footers plugin.",
            "Create a Custom HTML snippet in the Footer / Body-end area.",
            "Paste this tag, save it, and enable the snippet site-wide.",
          ],
          code: exactScript,
        },
        {
          label: "footer.php",
          filename: "footer.php",
          lang: "php",
          steps: [
            "Open Appearance → Theme File Editor → footer.php.",
            "Paste the generated tag after wp_footer() and before </body>.",
            "Update the file; repeat this after changing themes.",
          ],
          code: `<?php wp_footer(); ?>

<!-- Scrappy AI widget -->
${exactScript}
</body>
</html>`,
        },
      ],
    },
    {
      id: "shopify",
      name: "Shopify",
      tip: "theme.liquid wraps the whole storefront, so one installation covers every store page.",
      variants: [
        {
          label: "Theme code",
          filename: "layout/theme.liquid",
          lang: "html",
          steps: [
            "Go to Online Store → Themes → Edit code.",
            "Open Layout → theme.liquid.",
            "Paste this tag before </body>, then save the theme.",
          ],
          code: `<!-- Scrappy AI widget -->
${exactScript}
</body>`,
        },
      ],
    },
    {
      id: "other",
      name: "Other",
      tip: "Use the shared template that owns the closing body tag so the widget loads site-wide.",
      variants: [
        {
          label: "Any stack",
          filename: "shared layout / footer",
          lang: "html",
          steps: [
            "Find the shared layout, footer, or global body-end code area.",
            "Paste the exact generated tag once before </body>.",
            "Publish your changes and use Verify Installation below.",
          ],
          code: exactScript,
        },
      ],
    },
  ];
}

export function FrameworkInstallGuide({ script }: FrameworkInstallGuideProps) {
  const config = useMemo(() => parseInstallationScript(script), [script]);
  const guides = useMemo(() => (config ? buildGuides(config) : []), [config]);
  const [activeId, setActiveId] = useState("html");
  const [variantIndex, setVariantIndex] = useState(0);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  if (!config) {
    return (
      <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
        <p className="text-[12.5px] font-semibold text-amber-900">
          Framework examples are unavailable for this script format.
        </p>
        <p className="mt-1 text-[12px] leading-relaxed text-amber-800">
          Use the canonical script above and place it before your site&apos;s closing
          &lt;/body&gt; tag.
        </p>
      </div>
    );
  }

  const active = guides.find((guide) => guide.id === activeId) ?? guides[0];
  const variant = active.variants[variantIndex] ?? active.variants[0];

  const selectGuide = (id: string) => {
    setActiveId(id);
    setVariantIndex(0);
  };

  const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex: number | null = null;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % guides.length;
    if (event.key === "ArrowLeft") nextIndex = (index - 1 + guides.length) % guides.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = guides.length - 1;
    if (nextIndex === null) return;

    event.preventDefault();
    const next = guides[nextIndex];
    selectGuide(next.id);
    tabRefs.current[next.id]?.focus();
  };

  return (
    <section className="mt-6 border-t border-ink-100 pt-6" aria-labelledby="framework-guide-title">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-50 text-accent-700">
          <PanelsTopLeft size={17} strokeWidth={2} />
        </div>
        <div>
          <h4 id="framework-guide-title" className="text-[14px] font-semibold text-ink-900">
            Install with your framework
          </h4>
          <p className="mt-0.5 text-[12.5px] leading-relaxed text-ink-500">
            Choose your stack for exact placement instructions using this website&apos;s real script.
          </p>
        </div>
      </div>

      <div
        role="tablist"
        aria-label="Framework installation guides"
        className="mt-5 flex max-w-full gap-1.5 overflow-x-auto pb-2"
      >
        {guides.map((guide, index) => {
          const selected = guide.id === active.id;
          return (
            <button
              key={guide.id}
              ref={(element) => {
                tabRefs.current[guide.id] = element;
              }}
              id={`framework-tab-${guide.id}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`framework-panel-${guide.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => selectGuide(guide.id)}
              onKeyDown={(event) => onTabKeyDown(event, index)}
              className={`shrink-0 rounded-lg border px-3 py-2 text-[12.5px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 ${
                selected
                  ? "border-ink-900 bg-ink-900 text-white"
                  : "border-ink-200 bg-white text-ink-600 hover:border-ink-300 hover:bg-ink-50 hover:text-ink-900"
              }`}
            >
              {guide.name}
            </button>
          );
        })}
      </div>

      <div
        key={active.id}
        id={`framework-panel-${active.id}`}
        role="tabpanel"
        aria-labelledby={`framework-tab-${active.id}`}
        tabIndex={0}
        className="mt-3 rounded-2xl border border-ink-200 bg-ink-50/60 p-4 outline-none focus-visible:ring-2 focus-visible:ring-accent-500 sm:p-5"
      >
        {active.variants.length > 1 && (
          <div className="mb-5 flex max-w-full gap-1 overflow-x-auto rounded-lg border border-ink-200 bg-white p-1 sm:w-fit">
            {active.variants.map((option, index) => (
              <button
                key={option.label}
                type="button"
                onClick={() => setVariantIndex(index)}
                aria-pressed={index === variantIndex}
                className={`shrink-0 rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 ${
                  index === variantIndex
                    ? "bg-accent-500 text-white shadow-sm"
                    : "text-ink-500 hover:bg-ink-50 hover:text-ink-900"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}

        <div className="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-500">
              {variant.label}
            </p>
            <ol className="mt-3 space-y-3">
              {variant.steps.map((step, index) => (
                <li key={step} className="flex gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-[10.5px] font-bold text-accent-700 ring-1 ring-ink-200">
                    {index + 1}
                  </span>
                  <p className="text-[12.5px] leading-relaxed text-ink-700">{step}</p>
                </li>
              ))}
            </ol>

            <div className="mt-4 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5">
              <Lightbulb size={14} className="mt-0.5 shrink-0 text-emerald-700" />
              <p className="text-[11.5px] leading-relaxed text-emerald-800">{active.tip}</p>
            </div>
          </div>

          <div className="min-w-0">
            <CodeBlock
              key={`${active.id}-${variant.label}`}
              code={variant.code}
              lang={variant.lang}
              filename={variant.filename}
              className="shadow-none"
            />
            <p className="mt-2 flex items-center gap-1.5 text-[10.5px] text-ink-500">
              <Code2 size={12} aria-hidden />
              Uses website ID {config.websiteId}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
