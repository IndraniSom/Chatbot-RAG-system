import type { Lang } from "./highlight";

export interface CodeSnippet {
  filename: string;
  lang: Lang;
  code: string;
}

export interface FrameworkStep {
  text: string;
}

export interface FrameworkVariant {
  label: string;
  steps: string[];
  snippet: CodeSnippet;
}

export interface Framework {
  id: string;
  name: string;
  /** One or more variants (e.g. Next.js App Router vs Pages Router). */
  variants: FrameworkVariant[];
  tip: string;
  propNotes?: { prop: string; note: string }[];
}

const HTML_SNIPPET = `<!-- Paste this just before the closing </body> tag -->
<script
  src="https://chatbot-widget.scrappy.ai/widget.js"
  data-website-id="YOUR_WEBSITE_ID"
  data-api-url="https://api.scrappy.ai">
</script>`;

export const FRAMEWORKS: Framework[] = [
  {
    id: "html",
    name: "HTML",
    variants: [
      {
        label: "index.html",
        steps: [
          "Open the HTML file for your page (or your shared layout/template).",
          "Paste the snippet immediately before the closing </body> tag.",
          "Save and deploy — the widget appears on every page that includes this markup.",
        ],
        snippet: { filename: "index.html", lang: "html", code: HTML_SNIPPET },
      },
    ],
    tip: "Placing the tag before </body> keeps it out of the critical render path, so your page paints first and the widget hydrates after.",
  },
  {
    id: "nextjs",
    name: "Next.js",
    variants: [
      {
        label: "App Router",
        steps: [
          "Open app/layout.tsx — your root layout.",
          "Import the next/script component.",
          "Render <Script> inside <body> with strategy=\"afterInteractive\".",
        ],
        snippet: {
          filename: "app/layout.tsx",
          lang: "jsx",
          code: `import Script from "next/script";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Script
          src="https://chatbot-widget.scrappy.ai/widget.js"
          data-website-id="YOUR_WEBSITE_ID"
          data-api-url="https://api.scrappy.ai"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}`,
        },
      },
      {
        label: "Pages Router",
        steps: [
          "Open pages/_app.tsx.",
          "Import next/script and render it alongside your <Component />.",
          "afterInteractive ensures it loads once the app is interactive.",
        ],
        snippet: {
          filename: "pages/_app.tsx",
          lang: "jsx",
          code: `import Script from "next/script";

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Script
        src="https://chatbot-widget.scrappy.ai/widget.js"
        data-website-id="YOUR_WEBSITE_ID"
        data-api-url="https://api.scrappy.ai"
        strategy="afterInteractive"
      />
    </>
  );
}`,
        },
      },
    ],
    propNotes: [
      { prop: "src", note: "The widget bundle. Always load it from Scrappy's CDN so you get automatic updates." },
      { prop: "data-website-id", note: "Your unique website identifier from the dashboard. This scopes the bot to your indexed content." },
      { prop: "data-api-url", note: "The API endpoint the widget talks to for chat completions." },
      { prop: "strategy", note: '"afterInteractive" loads the script once the page is interactive — ideal for third-party widgets that don\'t block first paint.' },
    ],
    tip: "Use next/script rather than a raw <script> tag so Next.js can manage loading order and avoid hydration warnings.",
  },
  {
    id: "react",
    name: "React",
    variants: [
      {
        label: "public/index.html",
        steps: [
          "For a Create React App / Vite project, open public/index.html.",
          "Paste the snippet before </body>. This is the simplest, framework-agnostic approach.",
          "You do NOT need useEffect — the widget is a plain script and manages its own lifecycle.",
        ],
        snippet: { filename: "public/index.html", lang: "html", code: HTML_SNIPPET },
      },
      {
        label: "App.tsx",
        steps: [
          "Prefer keeping it in JSX? Inject the script once on mount.",
          "A single useEffect with an empty dependency array runs it exactly once.",
          "This is optional — the index.html approach is recommended.",
        ],
        snippet: {
          filename: "App.tsx",
          lang: "jsx",
          code: `import { useEffect } from "react";

export default function App() {
  useEffect(() => {
    const s = document.createElement("script");
    s.src = "https://chatbot-widget.scrappy.ai/widget.js";
    s.dataset.websiteId = "YOUR_WEBSITE_ID";
    s.dataset.apiUrl = "https://api.scrappy.ai";
    document.body.appendChild(s);
  }, []);

  return <YourApp />;
}`,
        },
      },
    ],
    tip: "A useEffect is NOT required. The recommended path is simply pasting the tag into public/index.html — the widget bootstraps itself.",
  },
  {
    id: "vue",
    name: "Vue",
    variants: [
      {
        label: "index.html",
        steps: [
          "Open index.html at the project root (Vite) or public/index.html.",
          "Paste the snippet before </body> — this is the cleanest option for Vue.",
        ],
        snippet: { filename: "index.html", lang: "html", code: HTML_SNIPPET },
      },
      {
        label: "App.vue",
        steps: [
          "Prefer to keep it in a component? Add the script in the mounted() hook.",
          "onMounted runs once the component is attached to the DOM.",
        ],
        snippet: {
          filename: "App.vue",
          lang: "jsx",
          code: `<script setup>
import { onMounted } from "vue";

onMounted(() => {
  const s = document.createElement("script");
  s.src = "https://chatbot-widget.scrappy.ai/widget.js";
  s.dataset.websiteId = "YOUR_WEBSITE_ID";
  s.dataset.apiUrl = "https://api.scrappy.ai";
  document.body.appendChild(s);
});
</script>`,
        },
      },
    ],
    tip: "For most Vue apps, dropping the tag into index.html is all you need — no lifecycle hooks required.",
  },
  {
    id: "angular",
    name: "Angular",
    variants: [
      {
        label: "src/index.html",
        steps: [
          "Open src/index.html — Angular's single host page.",
          "Paste the snippet just before </body>.",
          "Angular serves this file for every route, so the widget is available app-wide.",
        ],
        snippet: { filename: "src/index.html", lang: "html", code: HTML_SNIPPET },
      },
    ],
    tip: "Because Angular is a single-page app served from index.html, one tag covers every route automatically.",
  },
  {
    id: "wordpress",
    name: "WordPress",
    variants: [
      {
        label: "Theme File Editor",
        steps: [
          "Go to Appearance → Theme File Editor in your WordPress admin.",
          "Open footer.php from the file list on the right.",
          "Paste the snippet immediately before the </body> tag and click Update File.",
        ],
        snippet: {
          filename: "footer.php",
          lang: "php",
          code: `<?php wp_footer(); ?>

<!-- Scrappy AI widget -->
<script
  src="https://chatbot-widget.scrappy.ai/widget.js"
  data-website-id="YOUR_WEBSITE_ID"
  data-api-url="https://api.scrappy.ai">
</script>
</body>
</html>`,
        },
      },
      {
        label: "Plugin (no code)",
        steps: [
          "Install a plugin such as \"Insert Headers and Footers\" or \"WPCode\".",
          "Open its Footer / Body-end section.",
          "Paste the snippet and save — no theme editing required, and it survives theme updates.",
        ],
        snippet: { filename: "Custom HTML block", lang: "html", code: HTML_SNIPPET },
      },
    ],
    tip: "Using a headers-&-footers plugin is the safest route — your snippet won't be wiped when you update or switch themes.",
  },
  {
    id: "shopify",
    name: "Shopify",
    variants: [
      {
        label: "theme.liquid",
        steps: [
          "From your admin, go to Online Store → Themes → ⋯ → Edit code.",
          "Open Layout → theme.liquid.",
          "Paste the snippet right before the closing </body> tag and Save.",
        ],
        snippet: {
          filename: "theme.liquid",
          lang: "html",
          code: `  <!-- Scrappy AI widget -->
  <script
    src="https://chatbot-widget.scrappy.ai/widget.js"
    data-website-id="YOUR_WEBSITE_ID"
    data-api-url="https://api.scrappy.ai">
  </script>
</body>
</html>`,
        },
      },
    ],
    tip: "theme.liquid wraps every storefront page, so a single paste covers your entire shop including product and collection pages.",
  },
  {
    id: "webflow",
    name: "Webflow",
    variants: [
      {
        label: "Custom Code",
        steps: [
          "Open Project Settings (gear icon) in the Webflow Designer.",
          "Navigate to the Custom Code tab.",
          "Paste the snippet into the Footer Code box, then Save and Publish.",
        ],
        snippet: { filename: "Footer Code", lang: "html", code: HTML_SNIPPET },
      },
    ],
    tip: "Footer Code injects your snippet before </body> on every published page — remember to Publish for changes to go live.",
  },
  {
    id: "wix",
    name: "Wix",
    variants: [
      {
        label: "Custom Code Injection",
        steps: [
          "Go to Settings → Custom Code in your Wix dashboard.",
          "Click + Add Custom Code and paste the snippet.",
          "Set it to load on \"All pages\", place it at the \"Body — end\", and Apply.",
        ],
        snippet: { filename: "Custom Code", lang: "html", code: HTML_SNIPPET },
      },
    ],
    tip: 'Choose "Body — end" placement so the widget mounts after your content, matching the recommended before-</body> position.',
  },
  {
    id: "custom",
    name: "Custom Website",
    variants: [
      {
        label: "Any stack",
        steps: [
          "Locate the shared template or layout rendered on every page.",
          "Paste the snippet before </body>.",
          "If your server sets a strict CSP, allow the Scrappy script and API origins (see tip).",
        ],
        snippet: { filename: "layout template", lang: "html", code: HTML_SNIPPET },
      },
    ],
    tip: "Using a Content-Security-Policy? Add https://chatbot-widget.scrappy.ai to script-src and https://api.scrappy.ai to connect-src.",
  },
];
