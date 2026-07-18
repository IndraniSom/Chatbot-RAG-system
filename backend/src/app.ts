import express from "express";
import cors from "cors";
import { apiReference } from "@scalar/express-api-reference";

import routes from "./routes";
import { openapiSpec } from "./openapi";

const app = express();

/**
 * CORS allow-list.
 *
 *  - Local dev: http://localhost:3000 (Next.js dashboard)
 *  - Production: the two Vercel deployments (dashboard + widget test)
 *  - Vercel preview URLs: every preview deployment gets a unique subdomain,
 *    so we allow the whole *.vercel.app origin via regex
 *
 * If you deploy the dashboard to your own domain, add it here too.
 */
const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "https://chatbot-rag-system.vercel.app",
  "https://chatbot-widget-ruby-nu.vercel.app",
  // Vercel preview deployments (branch previews, PR previews, etc.)
  /^https:\/\/chatbot-rag-system-git-[a-z0-9-]+\.vercel\.app$/,
  /^https:\/\/chatbot-widget-git-[a-z0-9-]+\.vercel\.app$/,
];

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow same-origin / curl / server-to-server (no Origin header)
      if (!origin) return cb(null, true);
      if (
        ALLOWED_ORIGINS.some((o) =>
          o instanceof RegExp ? o.test(origin) : o === origin
        )
      ) {
        return cb(null, true);
      }
      return cb(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  })
);

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// ----- API documentation (Scalar) -----
// OpenAPI 3.1 spec served as JSON, rendered as a beautiful docs UI by Scalar.
app.get("/api/openapi.json", (_req, res) => {
  res.type("application/json").send(openapiSpec);
});

app.use(
  "/api/docs",
  apiReference({
    spec: { content: openapiSpec as unknown as Record<string, unknown> },
    theme: "purple",
    pageTitle: "Scrappy AI · API Reference",
    layout: "modern",
    darkMode: true,
    hideClientButton: false,
  })
);

// ----- API routes -----
app.use("/api", routes);

export default app;