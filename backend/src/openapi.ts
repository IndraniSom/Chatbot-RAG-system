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
              examples: {
                greeting: {
                  summary: "Greeting",
                  value: {
                    websiteId: "example_com",
                    message: "Hello!",
                  },
                },
                pricing: {
                  summary: "Pricing question",
                  value: {
                    websiteId: "example_com",
                    message: "What are your pricing plans?",
                  },
                },
                refund: {
                  summary: "Refund question",
                  value: {
                    websiteId: "example_com",
                    message: "How do refunds work?",
                  },
                },
              },
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
          "400": {
            description:
              "Validation error — websiteId or message missing/empty",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MessageErrorResponse" },
              },
            },
          },
          "500": {
            description: "Chatbot failed to generate a response",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/QdrantErrorResponse" },
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
    },
  },
} as const;