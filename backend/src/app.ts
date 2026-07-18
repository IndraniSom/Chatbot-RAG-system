import express from "express";
import cors from "cors";
import { apiReference } from "@scalar/express-api-reference";

import routes from "./routes";
import { openapiSpec } from "./openapi";
import Website from "./models/website";
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
  "https://billeif.com",

  /^https:\/\/chatbot-rag-system-git-[a-z0-9-]+\.vercel\.app$/,
  /^https:\/\/chatbot-widget-git-[a-z0-9-]+\.vercel\.app$/,
];

app.use(
  cors({
    origin: async (origin, callback) => {
      // Server-to-server requests
      if (!origin) {
        return callback(null, true);
      }

      // Existing allow list
      const isAllowedOrigin = ALLOWED_ORIGINS.some((allowed) =>
        allowed instanceof RegExp
          ? allowed.test(origin)
          : allowed === origin
      );

      if (isAllowedOrigin) {
        return callback(null, true);
      }

      try {
        const hostname = new URL(origin).hostname.toLowerCase();

        // Root domain: `www.billeif.com` -> `billeif.com`.
        // Websites store `domain` as the root (www stripped) and
        // `allowedDomains` as both `[root, www.root]`, so match either the
        // exact hostname (root or www) against allowedDomains, or the
        // stripped root against domain.
        const rootDomain = hostname.replace(/^www\./, "");

        const website = await Website.findOne({
          status: "APPROVED",
          $or: [
            { allowedDomains: hostname },
            { allowedDomains: rootDomain },
            { domain: rootDomain },
          ],
        });

        if (website) {
          return callback(null, true);
        }

        return callback(
          new Error(`CORS: origin ${origin} not allowed`)
        );
      } catch {
        return callback(new Error("Invalid origin"));
      }
    },

    credentials: false,
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