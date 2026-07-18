import { QdrantClient } from "@qdrant/js-client-rest";
import env from "../../config/env";
import { EmbeddedChunk } from "../embedding/embedding.service";

export interface QdrantSearchResult {
  id: string | number;
  score: number;
  content: string;

  metadata: {
    websiteId: string;
    url: string;
    title: string;
    language: string;
    chunkIndex: number;
  };
}
class QdrantService {
  private readonly client: QdrantClient;

  private readonly collectionName: string;
  
  constructor() {
    const url =
      env.qdrant.url ||
      "http://localhost:6333";

    const apiKey =
      env.qdrant.apiKey;

    this.collectionName =
      env.qdrant.collection ||
      "scrappy_knowledge";

    /**
     * Create Qdrant client.
     *
     * API key is only needed when using
     * Qdrant Cloud or an authenticated instance.
     */
    this.client = new QdrantClient({
      url,
      ...(apiKey
        ? {
            apiKey,
          }
        : {}),
    });
  }

  /**
   * Test whether we can communicate
   * with Qdrant.
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.client.getCollections();

      return true;
    } catch (error) {
      console.error(
        "❌ Qdrant connection failed:",
        error
      );

      return false;
    }
  }

  /**
   * Check whether our collection
   * already exists.
   */
  async collectionExists(): Promise<boolean> {
    const collections =
      await this.client.getCollections();

    return collections.collections.some(
      (collection) =>
        collection.name ===
        this.collectionName
    );
  }

  /**
   * Create the Qdrant collection.
   *
   * vectorSize MUST match the dimension
   * returned by the NVIDIA embedding model.
   */
async createCollection(
  vectorSize: number
): Promise<void> {
  if (vectorSize <= 0) {
    throw new Error(
      "Vector size must be greater than 0"
    );
  }

  console.log(
    `📦 Creating Qdrant collection: ${this.collectionName}`
  );

  await this.client.createCollection(
    this.collectionName,
    {
      vectors: {
        size: vectorSize,
        distance: "Cosine",
      },
    }
  );

  console.log(
    "✅ Qdrant collection created"
  );
}

  /**
   * Ensure that the collection exists.
   *
   * If it doesn't exist, create it.
   */
async ensureCollection(
  vectorSize: number
): Promise<void> {
  /**
   * Check whether the collection
   * already exists.
   */
  const exists =
    await this.collectionExists();

  /**
   * Create it if necessary.
   */
  if (!exists) {
    await this.createCollection(
      vectorSize
    );
  } else {
    console.log(
      `✅ Qdrant collection already exists: ${this.collectionName}`
    );
  }

  /**
   * Always make sure websiteId
   * has a keyword payload index.
   *
   * Required for filtered searches:
   *
   * websiteId = "runforsafefood"
   */
  await this.ensureWebsiteIdIndex();
}

  /**
   * Store embedded chunks in Qdrant.
   */
async upsertChunks(
  chunks: EmbeddedChunk[],
  websiteId: string
): Promise<void> {
    if (chunks.length === 0) {
      console.log(
        "⚠️ No embedded chunks to store"
      );

      return;
    }

    /**
     * Determine vector dimension
     * from the first chunk.
     */
    const vectorSize =
      chunks[0].vector.length;

    /**
     * Verify every vector has
     * the same dimension.
     */
    for (const chunk of chunks) {
      if (
        chunk.vector.length !==
        vectorSize
      ) {
        throw new Error(
          `Vector dimension mismatch for chunk ${chunk.id}`
        );
      }
    }

    /**
     * Create collection if needed.
     */
    await this.ensureCollection(
      vectorSize
    );

    /**
     * Convert EmbeddedChunk[]
     * into Qdrant points.
     */
    const points = chunks.map(
  (chunk) => ({
    id: chunk.id,

    vector: chunk.vector,

    payload: {
      websiteId,

      content: chunk.content,

      url: chunk.metadata.url,

      title: chunk.metadata.title,

      language: chunk.metadata.language,

      chunkIndex:
        chunk.metadata.chunkIndex,
    },
  })
);

    console.log(
      `📤 Uploading ${points.length} points to Qdrant`
    );

    await this.client.upsert(
      this.collectionName,
      {
        wait: true,
        points,
      }
    );

    console.log(
      `✅ ${points.length} points stored in Qdrant`
    );
  }

  /**
   * Return basic information about
   * the current collection.
   *
   * Useful for debugging.
   */
  async getCollectionInfo() {
    const exists =
      await this.collectionExists();

    if (!exists) {
      return null;
    }

    return this.client.getCollection(
      this.collectionName
    );
  }
  /**
 * Search Qdrant for chunks that are
 * semantically similar to the query vector.
 *
 * Results are filtered by websiteId
 * so one website cannot retrieve another
 * website's content.
 */
async search(
  vector: number[],
  websiteId: string,
  limit: number = 5,
  scoreThreshold?: number
): Promise<QdrantSearchResult[]> {
  /**
   * Validate query vector.
   */
  if (!vector.length) {
    throw new Error(
      "Search vector cannot be empty"
    );
  }

  /**
   * websiteId is mandatory.
   *
   * We never want to perform an
   * unfiltered search in a multi-website
   * collection.
   */
  if (!websiteId.trim()) {
    throw new Error(
      "websiteId is required for vector search"
    );
  }

  if (limit <= 0) {
    throw new Error(
      "Search limit must be greater than 0"
    );
  }

  /**
   * Make sure the collection exists.
   */
  const exists =
    await this.collectionExists();

  if (!exists) {
    throw new Error(
      `Qdrant collection "${this.collectionName}" does not exist`
    );
  }

  console.log(
    `🔎 Searching Qdrant for website: ${websiteId}`
  );

  /**
   * Perform vector similarity search.
   *
   * The filter ensures we search only
   * vectors belonging to this website.
   */
  const results =
    await this.client.search(
      this.collectionName,
      {
        vector,

        limit,

        with_payload: true,

        with_vector: false,

        filter: {
          must: [
            {
              key: "websiteId",

              match: {
                value: websiteId,
              },
            },
          ],
        },

        ...(scoreThreshold !== undefined
          ? {
              score_threshold:
                scoreThreshold,
            }
          : {}),
      }
    );

  /**
   * Convert raw Qdrant results into
   * our application's own structure.
   */
  return results.map(
    (result): QdrantSearchResult => {
      const payload =
        result.payload || {};

      return {
        id: result.id,

        score: result.score,

        content:
          typeof payload.content ===
          "string"
            ? payload.content
            : "",

        metadata: {
          websiteId:
            typeof payload.websiteId ===
            "string"
              ? payload.websiteId
              : "",

          url:
            typeof payload.url ===
            "string"
              ? payload.url
              : "",

          title:
            typeof payload.title ===
            "string"
              ? payload.title
              : "",

          language:
            typeof payload.language ===
            "string"
              ? payload.language
              : "en",

          chunkIndex:
            typeof payload.chunkIndex ===
            "number"
              ? payload.chunkIndex
              : 0,
        },
      };
    }
  );
}
/**
 * Create a payload index for websiteId.
 *
 * This allows Qdrant to efficiently filter:
 *
 * websiteId = "runforsafefood"
 */
/**
 * Ensure that websiteId has a keyword payload index.
 *
 * Required because we use websiteId
 * as a filter during vector retrieval.
 */
async ensureWebsiteIdIndex(): Promise<void> {
  try {
    console.log(
      "🔧 Ensuring websiteId payload index exists..."
    );

    await this.client.createPayloadIndex(
      this.collectionName,
      {
        field_name: "websiteId",
        field_schema: "keyword",
        wait: true,
      }
    );

    console.log(
      "✅ websiteId payload index is ready"
    );
  } catch (error: any) {
    /**
     * Depending on your Qdrant version/client,
     * creating an existing index may return
     * an error.
     */
    const errorMessage =
      error?.message ||
      error?.data?.status?.error ||
      "";

    if (
      errorMessage
        .toLowerCase()
        .includes("already exists")
    ) {
      console.log(
        "✅ websiteId payload index already exists"
      );

      return;
    }

    throw error;
  }
}
async deleteWebsiteVectors(
  websiteId: string
) {
  const COLLECTION_NAME = process.env.QDRANT_COLLECTION!;
  await this.client.delete(
    COLLECTION_NAME,
    {
      filter: {
        must: [
          {
            key: "websiteId",
            match: {
              value: websiteId,
            },
          },
        ],
      },
    }
  );

  console.log(
    `🗑 Deleted vectors for ${websiteId}`
  );
}

}

export default new QdrantService();