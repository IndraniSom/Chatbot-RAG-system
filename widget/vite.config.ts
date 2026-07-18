import { defineConfig } from "vite";
import { resolve } from "node:path";

/**
 * Vite config for the embeddable chat widget.
 *
 * Produces a single self-contained `dist/widget.js` file (no ES module
 * exports, no separate chunk files) that any website can load via:
 *
 *   <script src="…/widget.js" data-website-id="ws_abc123"></script>
 *
 * Output format is `iife` so the file works in <script> tags without
 * type="module". It's not minified by default so the dev experience stays
 * debuggable; flip `minify: true` in production.
 */
export default defineConfig({
  build: {
    outDir: "dist",
    emptyOutDir: true,
    target: "es2018",
    cssCodeSplit: false,
    minify: false,
    lib: {
      entry: resolve(__dirname, "src/widget.ts"),
      name: "ScrappyWidget",
      formats: ["iife"],
      fileName: () => "widget.js",
    },
    rollupOptions: {
      // Don't inline node_modules — we want zero runtime dependencies.
      external: [],
      output: { inlineDynamicImports: true },
    },
  },
});