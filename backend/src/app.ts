import express from "express";
import cors from "cors";
import { apiReference } from "@scalar/express-api-reference";

import routes from "./routes";
import { openapiSpec } from "./openapi";

const app = express();
app.use(
  cors({
    origin:
      "http://localhost:5173",
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