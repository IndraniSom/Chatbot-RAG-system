/**
 * OpenAPI 3.1 specification for the Scrappy AI backend.
 *
 * Exposed at GET /api/openapi.json and rendered by Scalar at GET /api/docs.
 * Edit this file to add new routes; Scalar will pick them up automatically.
 */
export const openapiSpec = {
  openapi: "3.1.0",
  info: {
    title: "Scrappy AI API",
    version: "1.0.0",
    description:
      "Backend API for Scrappy AI — an embeddable chat widget. This is the public surface used by the frontend. Mock implementations are in place for `/api/chat`.",
  },
  servers: [
    { url: "http://localhost:5000/api", description: "Local dev" },
  ],
  tags: [
    { name: "Health", description: "Service health & uptime" },
    { name: "Chat", description: "Conversational endpoints" },
    {
      name: "Browser",
      description:
        "Playwright-backed web browser used by the crawler to load pages.",
    },
    {
      name: "Chunking",
      description:
        "Crawl → clean → deduplicate → chunk pipeline. Returns the chunks that downstream embedding/vector-DB steps will consume.",
    },
    {
      name: "Embedding",
      description:
        "NVIDIA-hosted embedding model used to vectorize chunks and queries.",
    },
    {
      name: "Qdrant",
      description:
        "Qdrant Cloud (vector database) health + collection inspection.",
    },
    {
      name: "Indexing",
      description:
        "End-to-end ingestion pipeline: crawl → clean → dedupe → chunk → embed → upsert into Qdrant.",
    },
    {
      name: "Retrieval",
      description:
        "Vector recall over the Qdrant knowledge base. Embeds a question and returns the top-k matching chunks.",
    },
    {
      name: "RAG",
      description:
        "Retrieval-augmented generation: combines vector recall with an NVIDIA-hosted LLM to produce grounded answers with source citations.",
    },
    {
      name: "Crawler",
      description:
        "BFS crawler that loads, extracts, and indexes pages into a local JSON database.",
    },
    {
      name: "Auth",
      description:
        "Customer authentication: register, login, and current-user lookup. JWT is returned on success and must be sent as `Authorization: Bearer <token>` on protected routes.",
    },
    {
      name: "Websites",
      description:
        "Customer-facing website management: submit, list, fetch, delete, plus installation + indexing flows. All routes require authentication.",
    },
    {
      name: "Admin",
      description:
        "Internal endpoints for Scrappy staff. Requires an authenticated user whose role is `ADMIN`.",
    },
  ],
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Health check",
        description: "Returns service health and uptime in seconds.",
        responses: {
          "200": {
            description: "Service is healthy",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/HealthResponse" },
              },
            },
          },
        },
      },
    },

    // ─────────────────────────────────────────────────────────────────
    // Auth — public register/login, protected /me
    // ─────────────────────────────────────────────────────────────────
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Create a new customer account",
        description:
          "Registers a new user, hashes the password with bcrypt, and returns a signed JWT plus the user profile. The token must be stored by the client and sent as `Authorization: Bearer <token>` on every subsequent request.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterRequest" },
              examples: {
                alex: {
                  summary: "New customer",
                  value: {
                    name: "Alex Johnson",
                    email: "alex@example.com",
                    password: "supersecret123",
                  },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Account created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" },
              },
            },
          },
          "400": {
            description:
              "Validation error — name / email / password missing or email already taken",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MessageErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Sign in an existing user",
        description:
          "Verifies the email + password against MongoDB and returns a fresh JWT plus the user profile.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" },
              examples: {
                login: {
                  summary: "Sign in",
                  value: {
                    email: "alex@example.com",
                    password: "supersecret123",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Login successful",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" },
              },
            },
          },
          "401": {
            description: "Invalid credentials",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MessageErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Get the currently-authenticated user",
        description:
          "Requires `Authorization: Bearer <token>`. Used by the frontend to validate a stored token and to hydrate the user profile after a page reload.",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Authenticated user",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["success", "data"],
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { $ref: "#/components/schemas/UserResponseData" },
                  },
                },
              },
            },
          },
          "401": {
            description: "Missing or invalid JWT",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MessageErrorResponse" },
              },
            },
          },
        },
      },
    },

    // ─────────────────────────────────────────────────────────────────
    // Websites — customer-facing (all require JWT)
    // ─────────────────────────────────────────────────────────────────
    "/websites": {
      post: {
        tags: ["Websites"],
        summary: "Submit a new website for approval",
        description:
          "Creates a PENDING website owned by the caller. The URL is normalized (http(s) prefix added if missing), the root domain is extracted, and the public `websiteId` (used in the widget snippet) is generated. Submits the same domain twice is rejected.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateWebsiteRequest" },
              examples: {
                example: {
                  summary: "Submit Run For Safe Food",
                  value: {
                    name: "Run For Safe Food",
                    url: "https://runforsafefood.org",
                  },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Website submitted",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/WebsiteResponse" },
              },
            },
          },
          "400": {
            description: "Validation error — name/url missing or invalid",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MessageErrorResponse" },
              },
            },
          },
          "401": {
            description: "Missing or invalid JWT",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MessageErrorResponse" },
              },
            },
          },
        },
      },
      get: {
        tags: ["Websites"],
        summary: "List the caller's websites",
        description:
          "Returns every website owned by the authenticated user, newest first.",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "User's websites",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/WebsitesListResponse" },
              },
            },
          },
          "401": {
            description: "Missing or invalid JWT",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MessageErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/websites/{id}": {
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          description: "Mongo ObjectId of the website.",
          schema: { type: "string" },
          example: "6a5b4a5e122152ae65668c4a",
        },
      ],
      get: {
        tags: ["Websites"],
        summary: "Get a single owned website",
        description:
          "Returns the website only if it belongs to the authenticated user (ownership is enforced server-side via `_id + userId`).",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Website found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/WebsiteResponse" },
              },
            },
          },
          "400": {
            description: "Invalid ObjectId",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MessageErrorResponse" },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
      delete: {
        tags: ["Websites"],
        summary: "Delete a website",
        description:
          "Allowed only while the website is `PENDING` or `REJECTED`. APPROVED websites must go through a cleanup flow before deletion because they have vectors in Qdrant.",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Deleted" },
          "400": { $ref: "#/components/responses/BadRequest" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "403": {
            description: "Approved websites cannot be deleted directly",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MessageErrorResponse" },
              },
            },
          },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/websites/{id}/installation": {
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          description: "Mongo ObjectId of the website.",
          schema: { type: "string" },
        },
      ],
      get: {
        tags: ["Websites"],
        summary: "Get the install snippet",
        description:
          "Returns the `<script>` tag the customer should paste into their site, plus metadata. Only available once the website is APPROVED.",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Installation info",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/InstallationResponse" },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "404": { $ref: "#/components/responses/NotFound" },
          "409": {
            description: "Website isn't approved yet",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MessageErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/websites/{id}/verify-installation": {
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          description: "Mongo ObjectId of the website.",
          schema: { type: "string" },
        },
      ],
      post: {
        tags: ["Websites"],
        summary: "Verify the widget is installed",
        description:
          "Launches headless Chromium, navigates to the customer's website, and looks for a `<script data-website-id=\"…\">` tag matching this website's public id. Updates `widgetStatus` to `INSTALLED` on success or `NOT_INSTALLED` on failure.",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Verification result",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/VerifyInstallationResponse" },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "404": { $ref: "#/components/responses/NotFound" },
          "409": {
            description: "Website isn't approved yet",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MessageErrorResponse" },
              },
            },
          },
          "500": {
            description: "Browser / network error during verification",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MessageErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/websites/{id}/index": {
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          description: "Mongo ObjectId of the website.",
          schema: { type: "string" },
        },
      ],
      post: {
        tags: ["Websites"],
        summary: "Start an indexing job",
        description:
          "Enqueues a BullMQ job to crawl → clean → chunk → embed → upsert into Qdrant. Pre-flips `indexingStatus` to `INDEXING` so the UI gets instant feedback. Returns 202 with the jobId. The BullMQ worker (separate process) picks it up within seconds.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: false,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/StartIndexingRequest" },
              examples: {
                default: {
                  summary: "Default (max 20 pages)",
                  value: { maxPages: 20 },
                },
              },
            },
          },
        },
        responses: {
          "202": {
            description: "Job queued",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StartIndexingResponse" },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "404": { $ref: "#/components/responses/NotFound" },
          "409": {
            description: "Website is not approved, or indexing already in progress",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MessageErrorResponse" },
              },
            },
          },
          "500": { $ref: "#/components/responses/InternalError" },
        },
      },
    },
    "/websites/{id}/index-status": {
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          description: "Mongo ObjectId of the website.",
          schema: { type: "string" },
        },
      ],
      get: {
        tags: ["Websites"],
        summary: "Get current indexing status",
        description:
          "Returns the website's stored indexing state plus the active job's progress (0-100). The frontend polls this every 2 seconds while the job is `INDEXING`.",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Current indexing state",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/IndexStatusResponse" },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/websites/{id}/index-job": {
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          description: "Mongo ObjectId of the website.",
          schema: { type: "string" },
        },
      ],
      delete: {
        tags: ["Websites"],
        summary: "Cancel an in-progress indexing job",
        description:
          "Removes the active BullMQ job for this website. Returns 409 if the job already finished (completed or failed), 404 if no job exists.",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Job cancelled" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "404": {
            description: "Website not found, or no active job for it",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MessageErrorResponse" },
              },
            },
          },
          "409": {
            description: "Job is already completed or failed",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MessageErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/test-chunking": {
      post: {
        tags: ["Chunking"],
        summary: "Run the crawl → clean → dedupe → chunk pipeline",
        description:
          "Crawls a seed URL with Playwright, cleans the extracted content, removes duplicate pages, and splits the survivors into overlapping chunks. Returns both a stats summary and the full chunk list, ready to feed into an embedding model.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ChunkingRequest" },
              examples: {
                example: {
                  summary: "Crawl & chunk example.com (max 5 pages)",
                  value: { url: "https://example.com", maxPages: 5 },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Pipeline stats + chunks",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ChunkingResponse" },
              },
            },
          },
          "400": {
            description: "Validation error — URL missing",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MessageErrorResponse" },
              },
            },
          },
          "500": {
            description: "Pipeline failure",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MessageErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/test-embedding": {
      post: {
        tags: ["Embedding"],
        summary: "Generate an embedding vector for a query",
        description:
          "Calls the configured NVIDIA embedding model and returns the float vector for a single piece of text. Useful for verifying the model is reachable and inspecting the vector dimension before creating a Qdrant collection.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/EmbeddingRequest" },
              examples: {
                query: {
                  summary: "Pricing question",
                  value: { text: "How much does the Pro plan cost?" },
                },
                dimension: {
                  summary: "Dimension probe",
                  value: { text: "Embedding dimension test" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Embedding vector",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/EmbeddingResponse" },
              },
            },
          },
          "400": {
            description: "Validation error — text missing",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MessageErrorResponse" },
              },
            },
          },
          "500": {
            description: "Embedding generation failed",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/EmbeddingErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/test-qdrant": {
      get: {
        tags: ["Qdrant"],
        summary: "Test the Qdrant Cloud connection",
        description:
          "Verifies that the backend can reach Qdrant Cloud, reports whether the configured knowledge collection already exists, and returns its full collection metadata when it does. Useful as a smoke test after configuring `QDRANT_URL`, `QDRANT_API_KEY`, and `QDRANT_COLLECTION` in `.env`.",
        responses: {
          "200": {
            description: "Successfully connected",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/QdrantResponse" },
              },
            },
          },
          "503": {
            description: "Could not connect to Qdrant Cloud",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MessageErrorResponse" },
              },
            },
          },
          "500": {
            description: "Qdrant test failed",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/QdrantErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/index-website": {
      post: {
        tags: ["Indexing"],
        summary: "Crawl + chunk + embed + upsert an entire website into Qdrant",
        description:
          "Runs the full ingestion pipeline in one call:\n\n1. Crawl the seed URL with Playwright (BFS, capped at `maxPages`)\n2. Clean + deduplicate the extracted content\n3. Chunk each unique page (default 2000 chars, 300 overlap)\n4. Generate embeddings in batches via the configured NVIDIA model\n5. Create the Qdrant collection if needed (matching the embedding dimension) and upsert every chunk\n\nUseful as a one-shot 'seed my chatbot's knowledge base' endpoint.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/IndexWebsiteRequest" },
              examples: {
                small: {
                  summary: "Crawl example.com (max 5 pages)",
                  value: { url: "https://example.com", maxPages: 5 },
                },
                default: {
                  summary: "Crawl docs site (max 20 pages)",
                  value: {
                    url: "https://docs.example.com",
                    maxPages: 20,
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Website indexed successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/IndexWebsiteResponse" },
              },
            },
          },
          "400": {
            description:
              "Validation error — URL missing or maxPages not a positive number",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MessageErrorResponse" },
              },
            },
          },
          "422": {
            description:
              "Pipeline produced no usable content (nothing crawled / cleaned / chunked). The body still includes `data.failedUrls` when applicable.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/IndexWebsiteUnprocessable" },
              },
            },
          },
          "500": {
            description: "Indexing failed",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/QdrantErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/test-retrieval": {
      post: {
        tags: ["Retrieval"],
        summary: "Search Qdrant for chunks relevant to a question",
        description:
          "Embeds the question via the NVIDIA model and runs a vector search against the configured Qdrant collection, filtered by `websiteId`. Returns the raw retrieved chunks so you can inspect scores, sources, and content before wiring up the LLM.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RetrievalRequest" },
              examples: {
                default: {
                  summary: "Top-5 chunks above no threshold",
                  value: {
                    websiteId: "example_com",
                    question: "How do refunds work?",
                    limit: 5,
                  },
                },
                strict: {
                  summary: "Top-3 with similarity ≥ 0.7",
                  value: {
                    websiteId: "example_com",
                    question: "How do refunds work?",
                    limit: 3,
                    scoreThreshold: 0.7,
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Chunks retrieved",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/RetrievalResponse" },
              },
            },
          },
          "400": {
            description:
              "Validation error — websiteId/question missing or limit invalid",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MessageErrorResponse" },
              },
            },
          },
          "500": {
            description: "Retrieval failed",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/QdrantErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/test-rag": {
      post: {
        tags: ["RAG"],
        summary: "Run the full retrieval-augmented generation pipeline",
        description:
          "Retrieves the most relevant chunks for a question, sends them as context to the configured NVIDIA chat model, and returns a grounded answer plus the unique source URLs that backed it. If retrieval yields no chunks, the answer is a polite refusal and `sources` is empty.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RAGRequest" },
              examples: {
                default: {
                  summary: "Default RAG call",
                  value: {
                    websiteId: "example_com",
                    question: "How do refunds work?",
                  },
                },
                tuned: {
                  summary: "Tuned retrieval + generation",
                  value: {
                    websiteId: "example_com",
                    question: "How do refunds work?",
                    retrievalLimit: 8,
                    scoreThreshold: 0.6,
                    temperature: 0.1,
                    maxTokens: 600,
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "RAG pipeline completed",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/RAGResponse" },
              },
            },
          },
          "400": {
            description:
              "Validation error — websiteId/question missing or numeric fields invalid",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MessageErrorResponse" },
              },
            },
          },
          "500": {
            description: "RAG pipeline failed",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/QdrantErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/test-browser": {
      post: {
        tags: ["Browser"],
        summary: "Open a URL in a headless browser",
        description:
          "Launches a headless Chromium via Playwright, navigates to the given URL, and returns the final URL, page title, and raw HTML. Used by the crawler to verify that a target site renders correctly.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/BrowserRequest" },
              examples: {
                example: {
                  summary: "Example site",
                  value: { url: "https://example.com" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Page rendered successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/BrowserResponse" },
              },
            },
          },
          "400": {
            description: "Validation error — URL missing",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/BrowserErrorResponse" },
              },
            },
          },
          "500": {
            description: "Failed to open website",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/BrowserErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/chat": {
      post: {
        tags: ["Chat"],
        summary: "Send a message to the website's chatbot",
        description:
          "Production chatbot endpoint. Runs the full RAG pipeline server-side: vector recall over the Qdrant knowledge base for the given `websiteId`, then a grounded answer from the configured NVIDIA chat model. Returns the answer plus the unique source URLs that backed it. Retrieval and generation parameters (limit, scoreThreshold, temperature, maxTokens) are tuned on the server — public callers can't override them.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ChatRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Assistant reply",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ChatResponse" },
              },
            },
          },
        },
      },
    },

    // ─────────────────────────────────────────────────────────────────
    // Admin — staff-only (require admin JWT)
    // ─────────────────────────────────────────────────────────────────
    "/admin/websites/pending": {
      get: {
        tags: ["Admin"],
        summary: "List websites awaiting approval",
        description: "Returns every website with status PENDING, newest first.",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Pending submissions",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AdminWebsitesListResponse",
                },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "403": {
            description: "Authenticated user is not an ADMIN",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MessageErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/admin/websites": {
      get: {
        tags: ["Admin"],
        summary: "List all websites across all customers",
        description:
          "Returns every website in the database (any status), newest first, with `userId` populated.",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "All websites",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AdminWebsitesListResponse",
                },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "403": {
            description: "Authenticated user is not an ADMIN",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MessageErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/admin/websites/{id}/approve": {
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          description: "Mongo ObjectId of the website to approve.",
          schema: { type: "string" },
        },
      ],
      patch: {
        tags: ["Admin"],
        summary: "Approve a pending website",
        description:
          "Flips `status` to APPROVED, stamps `approvedAt` and `approvedBy`, and clears any previous rejection reason. The customer will then see the install snippet on their dashboard.",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Approved",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/WebsiteResponse" },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "403": {
            description: "Authenticated user is not an ADMIN",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MessageErrorResponse" },
              },
            },
          },
          "404": { $ref: "#/components/responses/NotFound" },
          "409": {
            description: "Website is not PENDING (already approved or rejected)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MessageErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/admin/websites/{id}/reject": {
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          description: "Mongo ObjectId of the website to reject.",
          schema: { type: "string" },
        },
      ],
      patch: {
        tags: ["Admin"],
        summary: "Reject a pending website",
        description:
          "Flips `status` to REJECTED, stores the supplied `reason` on the website so the customer can see it on their dashboard, and clears any approval metadata.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RejectWebsiteRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Rejected",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/WebsiteResponse" },
              },
            },
          },
          "400": {
            description: "Missing or empty `reason`",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MessageErrorResponse" },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "403": {
            description: "Authenticated user is not an ADMIN",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MessageErrorResponse" },
              },
            },
          },
          "404": { $ref: "#/components/responses/NotFound" },
          "409": {
            description: "Website is not PENDING",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MessageErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/admin/users": {
      get: {
        tags: ["Admin"],
        summary: "List all users",
        description:
          "Returns every registered user. Passwords are excluded server-side.",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "All users",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AdminUsersListResponse",
                },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "403": {
            description: "Authenticated user is not an ADMIN",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MessageErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/crawl": {
      post: {
        tags: ["Crawler"],
        summary: "Crawl a website starting from a seed URL",
        description:
          "Launches a BFS crawl from the seed URL. For each discovered page it opens the URL with Playwright, extracts metadata + readable content (via Readability) + links, and persists the result to the local JSON database. Capped at `maxPages` (1-100, default 20).",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CrawlRequest" },
              examples: {
                example: {
                  summary: "Crawl example.com (max 5 pages)",
                  value: { url: "https://example.com", maxPages: 5 },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Crawl summary",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CrawlResponse" },
              },
            },
          },
          "400": {
            description: "Validation error — URL missing or invalid",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "500": {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/crawl/pages": {
      get: {
        tags: ["Crawler"],
        summary: "List all indexed pages",
        description:
          "Returns every page currently stored in the local crawler database.",
        responses: {
          "200": {
            description: "List of indexed pages",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PagesResponse" },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Crawler"],
        summary: "Wipe the crawler database",
        description: "Removes every indexed page from the local database.",
        responses: {
          "200": {
            description: "Database cleared",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PagesResponse" },
              },
            },
          },
        },
      },
    },
    "/crawl/pages/{url}": {
      get: {
        tags: ["Crawler"],
        summary: "Fetch a single indexed page",
        description:
          "Returns the full record (including extracted content) for a page previously indexed by `/api/crawl`. The `{url}` path parameter must be URL-encoded.",
        parameters: [
          {
            name: "url",
            in: "path",
            required: true,
            description: "URL-encoded page URL to look up.",
            schema: { type: "string" },
            example: "https%3A%2F%2Fexample.com%2F",
          },
        ],
        responses: {
          "200": {
            description: "Page found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PageResponse" },
              },
            },
          },
          "404": {
            description: "Page not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/crawl/search": {
      get: {
        tags: ["Crawler"],
        summary: "Search indexed pages",
        description:
          "Naive substring search across the title, description, and content of every indexed page. Title hits score higher than body hits. Returns up to `limit` (default 10, max 50) results.",
        parameters: [
          {
            name: "q",
            in: "query",
            required: true,
            description: "Search query string.",
            schema: { type: "string" },
            example: "refund",
          },
          {
            name: "limit",
            in: "query",
            required: false,
            description: "Maximum number of hits to return (1-50).",
            schema: { type: "integer", minimum: 1, maximum: 50, default: 10 },
          },
        ],
        responses: {
          "200": {
            description: "Search hits",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SearchResponse" },
              },
            },
          },
          "400": {
            description: "Validation error — `q` missing",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      HealthResponse: {
        type: "object",
        required: ["success", "message", "uptime"],
        properties: {
          success: { type: "boolean", example: true },
          message: { type: "string", example: "Backend is healthy 🚀" },
          uptime: {
            type: "number",
            description: "Seconds since the process started.",
            example: 1234.56,
          },
        },
      },
      ChatRequest: {
        type: "object",
        required: ["websiteId", "message"],
        properties: {
          websiteId: {
            type: "string",
            description:
              "Identifier of the website whose knowledge base should answer the question. Must match the `websiteId` payload stored during `/api/index-website`.",
            example: "example_com",
          },
          message: {
            type: "string",
            minLength: 1,
            description: "The user's message text.",
            example: "How do refunds work?",
          },
        },
      },
      BrowserRequest: {
        type: "object",
        required: ["url"],
        properties: {
          url: {
            type: "string",
            format: "uri",
            description: "Absolute http(s) URL to open in the headless browser.",
            example: "https://example.com",
          },
        },
      },
      BrowserResponse: {
        type: "object",
        required: ["success", "data"],
        properties: {
          success: { type: "boolean", example: true },
          data: {
            type: "object",
            required: ["url", "title", "html"],
            properties: {
              url: {
                type: "string",
                description:
                  "Final URL after any redirects the page went through.",
                example: "https://example.com/",
              },
              title: {
                type: "string",
                description: "Contents of the page's <title> tag.",
                example: "Example Domain",
              },
              html: {
                type: "string",
                description: "Full rendered HTML returned by Playwright.",
              },
            },
          },
        },
      },
      BrowserErrorResponse: {
        type: "object",
        required: ["success", "message"],
        properties: {
          success: { type: "boolean", example: false },
          message: {
            type: "string",
            example: "URL is required",
          },
        },
      },
      ChatResponse: {
        type: "object",
        required: ["success", "data"],
        properties: {
          success: { type: "boolean", example: true },
          data: {
            type: "object",
            required: ["answer", "sources"],
            properties: {
              answer: {
                type: "string",
                description:
                  "Grounded assistant reply generated by the RAG pipeline. When retrieval yields nothing, this is a polite refusal.",
                example:
                  "Refunds are available within 14 days of purchase, no questions asked.",
              },
              sources: {
                type: "array",
                description:
                  "Unique source URLs that backed the answer, sorted by best similarity score.",
                items: { $ref: "#/components/schemas/RAGSource" },
              },
            },
          },
        },
      },
      ErrorResponse: {
        type: "object",
        required: ["success", "error"],
        properties: {
          success: { type: "boolean", example: false },
          error: { type: "string", example: "Message is required." },
        },
      },
      CrawlRequest: {
        type: "object",
        required: ["url"],
        properties: {
          url: {
            type: "string",
            format: "uri",
            description: "Absolute http(s) URL to start the crawl from.",
            example: "https://example.com",
          },
          maxPages: {
            type: "integer",
            minimum: 1,
            maximum: 100,
            default: 20,
            description: "Cap on the number of pages to crawl.",
          },
        },
      },
      CrawledPageSummary: {
        type: "object",
        required: ["url", "title"],
        properties: {
          url: { type: "string", example: "https://example.com/" },
          title: { type: "string", example: "Example Domain" },
          description: { type: "string", example: "" },
          language: { type: "string", example: "en" },
        },
      },
      CrawlResponse: {
        type: "object",
        required: ["success", "data"],
        properties: {
          success: { type: "boolean", example: true },
          data: {
            type: "object",
            required: [
              "startUrl",
              "maxPages",
              "pages",
              "visitedCount",
              "indexedCount",
              "failedPages",
            ],
            properties: {
              startUrl: { type: "string" },
              maxPages: { type: "integer" },
              pages: {
                type: "array",
                items: { $ref: "#/components/schemas/CrawledPageSummary" },
              },
              visitedCount: { type: "integer" },
              indexedCount: { type: "integer" },
              failedPages: {
                type: "array",
                items: { type: "string" },
              },
            },
          },
        },
      },
      StoredPage: {
        type: "object",
        required: ["url", "title", "description", "language", "content", "links", "indexedAt"],
        properties: {
          url: { type: "string" },
          title: { type: "string" },
          description: { type: "string" },
          language: { type: "string" },
          content: {
            type: "string",
            description: "Readable text content extracted via Readability.",
          },
          links: { type: "array", items: { type: "string" } },
          indexedAt: { type: "string", format: "date-time" },
        },
      },
      PagesResponse: {
        type: "object",
        required: ["success", "data"],
        properties: {
          success: { type: "boolean", example: true },
          data: {
            type: "object",
            required: ["count", "pages"],
            properties: {
              count: { type: "integer" },
              pages: {
                type: "array",
                items: { $ref: "#/components/schemas/StoredPage" },
              },
            },
          },
        },
      },
      PageResponse: {
        type: "object",
        required: ["success", "data"],
        properties: {
          success: { type: "boolean", example: true },
          data: { $ref: "#/components/schemas/StoredPage" },
        },
      },
      SearchResponse: {
        type: "object",
        required: ["success", "data"],
        properties: {
          success: { type: "boolean", example: true },
          data: {
            type: "object",
            required: ["query", "count", "hits"],
            properties: {
              query: { type: "string" },
              count: { type: "integer" },
              hits: {
                type: "array",
                items: { $ref: "#/components/schemas/StoredPage" },
              },
            },
          },
        },
      },
      ChunkingRequest: {
        type: "object",
        required: ["url"],
        properties: {
          url: {
            type: "string",
            format: "uri",
            description: "Seed URL to crawl, clean, dedupe, and chunk.",
            example: "https://example.com",
          },
          maxPages: {
            type: "integer",
            minimum: 1,
            maximum: 100,
            default: 10,
            description: "Cap on pages to crawl before chunking.",
          },
        },
      },
      ChunkMetadata: {
        type: "object",
        required: ["url", "title", "language", "chunkIndex"],
        properties: {
          url: { type: "string" },
          title: { type: "string" },
          language: { type: "string" },
          chunkIndex: { type: "integer" },
        },
      },
      DocumentChunk: {
        type: "object",
        required: ["id", "content", "metadata"],
        properties: {
          id: {
            type: "string",
            description: "Deterministic sha256 ID derived from url + index + content.",
          },
          content: { type: "string" },
          metadata: { $ref: "#/components/schemas/ChunkMetadata" },
        },
      },
      ChunkingStats: {
        type: "object",
        required: [
          "visitedPages",
          "crawledPages",
          "failedPages",
          "cleanedPages",
          "duplicatesRemoved",
          "uniquePages",
          "totalChunks",
        ],
        properties: {
          visitedPages: { type: "integer" },
          crawledPages: { type: "integer" },
          failedPages: { type: "integer" },
          cleanedPages: { type: "integer" },
          duplicatesRemoved: { type: "integer" },
          uniquePages: { type: "integer" },
          totalChunks: { type: "integer" },
        },
      },
      ChunkingResponse: {
        type: "object",
        required: ["success", "data"],
        properties: {
          success: { type: "boolean", example: true },
          data: {
            type: "object",
            required: ["stats", "failedPages", "chunks"],
            properties: {
              stats: { $ref: "#/components/schemas/ChunkingStats" },
              failedPages: {
                type: "array",
                items: { type: "string" },
              },
              chunks: {
                type: "array",
                items: { $ref: "#/components/schemas/DocumentChunk" },
              },
            },
          },
        },
      },
      EmbeddingRequest: {
        type: "object",
        required: ["text"],
        properties: {
          text: {
            type: "string",
            minLength: 1,
            description: "The text to embed. Sent as a 'query' to the NVIDIA model.",
            example: "How much does the Pro plan cost?",
          },
        },
      },
      EmbeddingData: {
        type: "object",
        required: ["text", "dimension", "vector"],
        properties: {
          text: { type: "string" },
          dimension: { type: "integer", example: 2048 },
          vector: {
            type: "array",
            description: "Float embedding vector returned by the model.",
            items: { type: "number" },
          },
        },
      },
      EmbeddingResponse: {
        type: "object",
        required: ["success", "data"],
        properties: {
          success: { type: "boolean", example: true },
          data: { $ref: "#/components/schemas/EmbeddingData" },
        },
      },
      MessageErrorResponse: {
        type: "object",
        required: ["success", "message"],
        properties: {
          success: { type: "boolean", example: false },
          message: {
            type: "string",
            example: "URL is required",
          },
        },
      },
      EmbeddingErrorResponse: {
        type: "object",
        required: ["success", "message", "error"],
        properties: {
          success: { type: "boolean", example: false },
          message: {
            type: "string",
            example: "Failed to generate embedding",
          },
          error: { type: "string", example: "NVIDIA_API_KEY is not configured" },
        },
      },
      QdrantCollectionInfo: {
        type: "object",
        description:
          "Subset of the Qdrant `getCollection` response we forward to the client. Extra fields returned by Qdrant are allowed under `additionalProperties`.",
        properties: {
          status: { type: "string", example: "green" },
          optimizer_status: { type: "string", example: "ok" },
          vectors_count: { type: "integer", example: 0 },
          indexed_vectors_count: { type: "integer", example: 0 },
          points_count: { type: "integer", example: 0 },
          segments_count: { type: "integer", example: 0 },
          config: {
            type: "object",
            additionalProperties: true,
            description: "Qdrant collection config payload.",
          },
        },
      },
      QdrantCollectionSummary: {
        type: "object",
        required: ["name", "exists"],
        properties: {
          name: {
            type: "string",
            description:
              "Collection name from QDRANT_COLLECTION (defaults to `scrappy_knowledge`).",
            example: "scrappy_knowledge",
          },
          exists: {
            type: "boolean",
            description: "True if the collection already exists in Qdrant.",
            example: true,
          },
          info: {
            nullable: true,
            description:
              "Full collection metadata when `exists` is true; null otherwise.",
            allOf: [{ $ref: "#/components/schemas/QdrantCollectionInfo" }],
          },
        },
      },
      QdrantData: {
        type: "object",
        required: ["connected", "collection"],
        properties: {
          connected: { type: "boolean", example: true },
          collection: { $ref: "#/components/schemas/QdrantCollectionSummary" },
        },
      },
      QdrantResponse: {
        type: "object",
        required: ["success", "message", "data"],
        properties: {
          success: { type: "boolean", example: true },
          message: {
            type: "string",
            example: "Successfully connected to Qdrant Cloud",
          },
          data: { $ref: "#/components/schemas/QdrantData" },
        },
      },
      QdrantErrorResponse: {
        type: "object",
        required: ["success", "message", "error"],
        properties: {
          success: { type: "boolean", example: false },
          message: {
            type: "string",
            example: "Failed to test Qdrant connection",
          },
          error: {
            type: "string",
            example: "Network error: ECONNREFUSED",
          },
        },
      },
      IndexWebsiteRequest: {
        type: "object",
        required: ["url"],
        properties: {
          url: {
            type: "string",
            format: "uri",
            description: "Seed URL to start crawling from.",
            example: "https://example.com",
          },
          maxPages: {
            type: "integer",
            minimum: 1,
            default: 20,
            description:
              "Cap on pages to crawl before chunking/embedding/upserting.",
          },
        },
      },
      IndexingStats: {
        type: "object",
        required: [
          "visitedPages",
          "crawledPages",
          "failedPages",
          "cleanedPages",
          "duplicatesRemoved",
          "uniquePages",
          "chunks",
          "embeddings",
          "vectorDimension",
          "storedPoints",
        ],
        properties: {
          visitedPages: { type: "integer", example: 5 },
          crawledPages: { type: "integer", example: 4 },
          failedPages: { type: "integer", example: 1 },
          cleanedPages: { type: "integer", example: 4 },
          duplicatesRemoved: { type: "integer", example: 0 },
          uniquePages: { type: "integer", example: 4 },
          chunks: { type: "integer", example: 7 },
          embeddings: { type: "integer", example: 7 },
          vectorDimension: { type: "integer", example: 2048 },
          storedPoints: { type: "integer", example: 7 },
        },
      },
      IndexWebsiteData: {
        type: "object",
        required: ["url", "stats", "failedUrls"],
        properties: {
          url: { type: "string", example: "https://example.com" },
          stats: { $ref: "#/components/schemas/IndexingStats" },
          failedUrls: {
            type: "array",
            items: { type: "string" },
          },
        },
      },
      IndexWebsiteResponse: {
        type: "object",
        required: ["success", "message", "data"],
        properties: {
          success: { type: "boolean", example: true },
          message: {
            type: "string",
            example: "Website indexed successfully",
          },
          data: { $ref: "#/components/schemas/IndexWebsiteData" },
        },
      },
      IndexWebsiteUnprocessable: {
        type: "object",
        required: ["success", "message"],
        properties: {
          success: { type: "boolean", example: false },
          message: {
            type: "string",
            example: "No pages could be crawled from the website",
          },
          data: {
            type: "object",
            properties: {
              failedUrls: {
                type: "array",
                items: { type: "string" },
              },
            },
          },
        },
      },
      RetrievalRequest: {
        type: "object",
        required: ["websiteId", "question"],
        properties: {
          websiteId: {
            type: "string",
            description:
              "Identifier of the website/collection to search inside. Matches the `websiteId` payload stored during `/api/index-website`.",
            example: "example_com",
          },
          question: {
            type: "string",
            minLength: 1,
            description: "The user's question. Embedded as a query vector.",
            example: "How do refunds work?",
          },
          limit: {
            type: "integer",
            minimum: 1,
            default: 5,
            description: "Maximum number of chunks to return.",
          },
          scoreThreshold: {
            type: "number",
            minimum: 0,
            maximum: 1,
            description:
              "Optional minimum similarity score; chunks below it are filtered out.",
          },
        },
      },
      QdrantChunkMetadata: {
        type: "object",
        required: ["websiteId", "url", "title", "language", "chunkIndex"],
        properties: {
          websiteId: { type: "string", example: "example_com" },
          url: { type: "string", example: "https://example.com/refunds" },
          title: { type: "string", example: "Refunds Policy" },
          language: { type: "string", example: "en" },
          chunkIndex: { type: "integer", example: 2 },
        },
      },
      QdrantSearchResult: {
        type: "object",
        required: ["id", "score", "content", "metadata"],
        properties: {
          id: {
            oneOf: [
              { type: "string" },
              { type: "integer" },
            ],
            description: "Qdrant point ID (string hash or integer).",
          },
          score: {
            type: "number",
            description: "Cosine similarity score returned by Qdrant.",
            example: 0.87,
          },
          content: { type: "string" },
          metadata: { $ref: "#/components/schemas/QdrantChunkMetadata" },
        },
      },
      RetrievalData: {
        type: "object",
        required: [
          "websiteId",
          "question",
          "queryVectorDimension",
          "resultsFound",
          "chunks",
        ],
        properties: {
          websiteId: { type: "string" },
          question: { type: "string" },
          queryVectorDimension: { type: "integer", example: 2048 },
          resultsFound: { type: "integer", example: 5 },
          chunks: {
            type: "array",
            items: { $ref: "#/components/schemas/QdrantSearchResult" },
          },
        },
      },
      RetrievalResponse: {
        type: "object",
        required: ["success", "message", "data"],
        properties: {
          success: { type: "boolean", example: true },
          message: {
            type: "string",
            example: "Retrieval completed successfully",
          },
          data: { $ref: "#/components/schemas/RetrievalData" },
        },
      },
      RAGRequest: {
        type: "object",
        required: ["websiteId", "question"],
        properties: {
          websiteId: {
            type: "string",
            description: "Website identifier to retrieve context from.",
            example: "example_com",
          },
          question: {
            type: "string",
            minLength: 1,
            description: "The user's question.",
            example: "How do refunds work?",
          },
          retrievalLimit: {
            type: "integer",
            minimum: 1,
            default: 5,
            description: "How many chunks to retrieve before generation.",
          },
          scoreThreshold: {
            type: "number",
            minimum: 0,
            maximum: 1,
            description: "Optional minimum similarity score.",
          },
          temperature: {
            type: "number",
            minimum: 0,
            maximum: 2,
            description: "LLM sampling temperature (defaults to 0.2).",
          },
          maxTokens: {
            type: "integer",
            minimum: 1,
            description: "LLM max output tokens (defaults to 1000).",
          },
        },
      },
      RAGSource: {
        type: "object",
        required: ["title", "url", "score"],
        properties: {
          title: { type: "string", example: "Refunds Policy" },
          url: { type: "string", example: "https://example.com/refunds" },
          score: {
            type: "number",
            description: "Highest similarity score among chunks from this page.",
            example: 0.87,
          },
        },
      },
      LLMUsage: {
        type: "object",
        properties: {
          promptTokens: { type: "integer", example: 612 },
          completionTokens: { type: "integer", example: 144 },
          totalTokens: { type: "integer", example: 756 },
        },
      },
      RAGMetadata: {
        type: "object",
        required: ["retrievedChunks", "queryVectorDimension"],
        properties: {
          retrievedChunks: { type: "integer", example: 5 },
          queryVectorDimension: { type: "integer", example: 2048 },
          model: {
            type: "string",
            example: "nvidia/nemotron-3-ultra-550b-a55b",
          },
          usage: { $ref: "#/components/schemas/LLMUsage" },
        },
      },
      RAGData: {
        type: "object",
        required: [
          "websiteId",
          "question",
          "answer",
          "sources",
          "metadata",
        ],
        properties: {
          websiteId: { type: "string" },
          question: { type: "string" },
          answer: {
            type: "string",
            description:
              "Grounded answer generated by the LLM. If no chunks were retrieved, this is a polite refusal.",
          },
          sources: {
            type: "array",
            description:
              "Unique page URLs that backed the answer, deduplicated and sorted by best score.",
            items: { $ref: "#/components/schemas/RAGSource" },
          },
          metadata: { $ref: "#/components/schemas/RAGMetadata" },
        },
      },
      RAGResponse: {
        type: "object",
        required: ["success", "message", "data"],
        properties: {
          success: { type: "boolean", example: true },
          message: {
            type: "string",
            example: "RAG pipeline completed successfully",
          },
          data: { $ref: "#/components/schemas/RAGData" },
        },
      },

      // ─────────────────────────────────────────────────────────────
      // Auth schemas
      // ─────────────────────────────────────────────────────────────
      RegisterRequest: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
          name: { type: "string", minLength: 1, example: "Alex Johnson" },
          email: {
            type: "string",
            format: "email",
            example: "alex@example.com",
          },
          password: {
            type: "string",
            minLength: 8,
            description: "Hashed with bcrypt before storage.",
            example: "supersecret123",
          },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string", minLength: 1 },
        },
      },
      AuthUser: {
        type: "object",
        required: ["id", "name", "email", "role", "status", "createdAt"],
        properties: {
          id: { type: "string", example: "65f0a1b2c3d4e5f6a7b8c9d0" },
          name: { type: "string", example: "Alex Johnson" },
          email: { type: "string", format: "email", example: "alex@example.com" },
          role: { type: "string", enum: ["USER", "ADMIN"] },
          status: { type: "string", enum: ["ACTIVE", "DISABLED"] },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      AuthData: {
        type: "object",
        required: ["token", "user"],
        properties: {
          token: {
            type: "string",
            description:
              "Signed JWT. Send as `Authorization: Bearer <token>` on protected routes.",
          },
          user: { $ref: "#/components/schemas/AuthUser" },
        },
      },
      AuthResponse: {
        type: "object",
        required: ["success", "message", "data"],
        properties: {
          success: { type: "boolean", example: true },
          message: {
            type: "string",
            example: "Account created successfully",
          },
          data: { $ref: "#/components/schemas/AuthData" },
        },
      },
      UserResponseData: {
        type: "object",
        required: ["user"],
        properties: {
          user: { $ref: "#/components/schemas/AuthUser" },
        },
      },

      // ─────────────────────────────────────────────────────────────
      // Website schemas
      // ─────────────────────────────────────────────────────────────
      CreateWebsiteRequest: {
        type: "object",
        required: ["name", "url"],
        properties: {
          name: { type: "string", minLength: 1, example: "Run For Safe Food" },
          url: {
            type: "string",
            format: "uri",
            description:
              "HTTP(S) URL. If the protocol is missing, https:// is assumed.",
            example: "https://runforsafefood.org",
          },
        },
      },
      Website: {
        type: "object",
        required: [
          "_id",
          "websiteId",
          "name",
          "url",
          "domain",
          "status",
          "widgetStatus",
          "indexingStatus",
          "isActive",
          "createdAt",
        ],
        properties: {
          _id: {
            type: "string",
            description:
              "Mongo ObjectId. Use this for /api/websites/:id routes.",
            example: "65f0a1b2c3d4e5f6a7b8c9d0",
          },
          websiteId: {
            type: "string",
            description:
              "Public id used in the widget snippet (data-website-id).",
            example: "ws_51322baf429e0ff0",
          },
          userId: {
            oneOf: [
              { type: "string" },
              { $ref: "#/components/schemas/AuthUser" },
            ],
            description:
              "String id on customer-facing routes; populated user object on admin routes.",
          },
          name: { type: "string" },
          url: { type: "string", format: "uri" },
          domain: { type: "string", example: "runforsafefood.org" },
          allowedDomains: {
            type: "array",
            items: { type: "string" },
          },
          status: {
            type: "string",
            enum: ["PENDING", "APPROVED", "REJECTED"],
          },
          rejectionReason: { type: "string" },
          widgetStatus: {
            type: "string",
            enum: ["NOT_INSTALLED", "INSTALLED"],
          },
          indexingStatus: {
            type: "string",
            enum: ["NOT_INDEXED", "INDEXING", "INDEXED", "FAILED"],
          },
          isActive: { type: "boolean" },
          lastIndexedAt: { type: "string", format: "date-time", nullable: true },
          lastIndexingError: { type: "string", nullable: true },
          approvedAt: { type: "string", format: "date-time" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      WebsiteResponse: {
        type: "object",
        required: ["success", "data"],
        properties: {
          success: { type: "boolean", example: true },
          data: { $ref: "#/components/schemas/Website" },
        },
      },
      WebsitesListResponse: {
        type: "object",
        required: ["success", "data"],
        properties: {
          success: { type: "boolean", example: true },
          data: {
            type: "object",
            required: ["count", "websites"],
            properties: {
              count: { type: "integer", example: 3 },
              websites: {
                type: "array",
                items: { $ref: "#/components/schemas/Website" },
              },
            },
          },
        },
      },
      InstallationInfo: {
        type: "object",
        required: [
          "websiteId",
          "websiteName",
          "url",
          "domain",
          "widgetStatus",
          "script",
        ],
        properties: {
          websiteId: { type: "string", example: "ws_51322baf429e0ff0" },
          websiteName: { type: "string", example: "Run For Safe Food" },
          url: { type: "string", format: "uri" },
          domain: { type: "string", example: "runforsafefood.org" },
          widgetStatus: {
            type: "string",
            enum: ["NOT_INSTALLED", "INSTALLED"],
          },
          script: {
            type: "string",
            description:
              "HTML snippet the customer pastes into their website (before </body>).",
            example: '<script src="..." data-website-id="..."></script>',
          },
        },
      },
      InstallationResponse: {
        type: "object",
        required: ["success", "data"],
        properties: {
          success: { type: "boolean", example: true },
          data: { $ref: "#/components/schemas/InstallationInfo" },
        },
      },
      VerifyInstallationResult: {
        type: "object",
        required: ["installed", "widgetStatus", "message"],
        properties: {
          installed: { type: "boolean", example: true },
          widgetStatus: {
            type: "string",
            enum: ["NOT_INSTALLED", "INSTALLED"],
          },
          websiteId: { type: "string" },
          message: {
            type: "string",
            example:
              "Scrappy is successfully installed on your website.",
          },
        },
      },
      VerifyInstallationResponse: {
        type: "object",
        required: ["success", "message", "data"],
        properties: {
          success: { type: "boolean", example: true },
          message: { type: "string" },
          data: { $ref: "#/components/schemas/VerifyInstallationResult" },
        },
      },
      StartIndexingRequest: {
        type: "object",
        properties: {
          maxPages: {
            type: "integer",
            minimum: 1,
            maximum: 100,
            default: 20,
            description: "Cap on pages to crawl before chunking/embedding.",
          },
        },
      },
      StartIndexingData: {
        type: "object",
        required: ["jobId", "status"],
        properties: {
          jobId: { type: "string" },
          status: { type: "string", enum: ["INDEXING"] },
        },
      },
      StartIndexingResponse: {
        type: "object",
        required: ["success", "message", "data"],
        properties: {
          success: { type: "boolean", example: true },
          message: { type: "string" },
          data: { $ref: "#/components/schemas/StartIndexingData" },
        },
      },
      IndexStatusData: {
        type: "object",
        required: ["indexingStatus", "progress", "lastIndexedAt", "lastIndexingError"],
        properties: {
          indexingStatus: {
            type: "string",
            enum: ["NOT_INDEXED", "INDEXING", "INDEXED", "FAILED"],
          },
          progress: {
            type: "integer",
            minimum: 0,
            maximum: 100,
            description: "0-100. From the active BullMQ job's progress field.",
          },
          lastIndexedAt: { type: "string", format: "date-time", nullable: true },
          lastIndexingError: { type: "string", nullable: true },
        },
      },
      IndexStatusResponse: {
        type: "object",
        required: ["success", "data"],
        properties: {
          success: { type: "boolean", example: true },
          data: { $ref: "#/components/schemas/IndexStatusData" },
        },
      },

      // ─────────────────────────────────────────────────────────────
      // Admin schemas
      // ─────────────────────────────────────────────────────────────
      AdminWebsitesListResponse: {
        type: "object",
        required: ["success", "data"],
        properties: {
          success: { type: "boolean", example: true },
          data: {
            type: "object",
            required: ["count", "websites"],
            properties: {
              count: { type: "integer" },
              websites: {
                type: "array",
                items: { $ref: "#/components/schemas/Website" },
              },
            },
          },
        },
      },
      AdminUsersListResponse: {
        type: "object",
        required: ["success", "data"],
        properties: {
          success: { type: "boolean", example: true },
          data: {
            type: "object",
            required: ["count", "users"],
            properties: {
              count: { type: "integer" },
              users: {
                type: "array",
                items: { $ref: "#/components/schemas/AuthUser" },
              },
            },
          },
        },
      },
      RejectWebsiteRequest: {
        type: "object",
        required: ["reason"],
        properties: {
          reason: {
            type: "string",
            minLength: 1,
            description: "Shown to the customer on their dashboard.",
            example: "Domain does not resolve. Please verify the URL.",
          },
        },
      },
    },
    responses: {
      Unauthorized: {
        description: "Missing or invalid JWT",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/MessageErrorResponse" },
          },
        },
      },
      NotFound: {
        description: "Resource not found",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/MessageErrorResponse" },
          },
        },
      },
      BadRequest: {
        description: "Validation error",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/MessageErrorResponse" },
          },
        },
      },
      InternalError: {
        description: "Server error",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/MessageErrorResponse" },
          },
        },
      },
    },
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description:
          "All /api/websites/* and /api/admin/* routes require `Authorization: Bearer <token>`. Get a token from POST /api/auth/login.",
      },
    },
  }
} as const;