import { DocumentChunk } from "../chunking/chunker.service";
import env from "../../config/env";
export interface EmbeddedChunk {
  id: string;
  content: string;
  vector: number[];

  metadata: {
    url: string;
    title: string;
    language: string;
    chunkIndex: number;
  };
}

interface NVIDIAEmbeddingResponse {
  data: Array<{
    index: number;
    embedding: number[];
  }>;

  model?: string;

  usage?: {
    prompt_tokens?: number;
    total_tokens?: number;
  };
}

type EmbeddingInputType = "passage" | "query";

class EmbeddingService {
  private readonly apiKey: string;

  private readonly apiUrl: string;

  private readonly model: string;

  /**
   * How many chunks we send to NVIDIA
   * in a single API request.
   */
  private readonly batchSize = 20;

  constructor() {
    this.apiKey =
      env.nvidia.apiKey || "";

    this.apiUrl =
      env.nvidia.embedding.url ||
      "https://integrate.api.nvidia.com/v1/embeddings";

    this.model =
      env.nvidia.embedding.model ||
      "nvidia/llama-nemotron-embed-1b-v2";

    if (!this.apiKey) {
      console.warn(
        "⚠️ NVIDIA_API_KEY is not configured"
      );
    }
  }

  /**
   * Low-level function that communicates
   * with the NVIDIA Embedding API.
   */
  private async generateEmbeddings(
    texts: string[],
    inputType: EmbeddingInputType
  ): Promise<number[][]> {
    if (!this.apiKey) {
      throw new Error(
        "NVIDIA_API_KEY is not configured"
      );
    }

    if (texts.length === 0) {
      return [];
    }

    const response = await fetch(
      this.apiUrl,
      {
        method: "POST",

        headers: {
          Authorization:
            `Bearer ${this.apiKey}`,

          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          model: this.model,

          input: texts,

          input_type: inputType,

          encoding_format: "float",
        }),
      }
    );

    if (!response.ok) {
      const errorBody =
        await response.text();

      throw new Error(
        `NVIDIA Embedding API failed: ${response.status} ${response.statusText} - ${errorBody}`
      );
    }

    const result =
      (await response.json()) as NVIDIAEmbeddingResponse;

    /**
     * Sort by index to guarantee that vectors
     * match the order of the input texts.
     */
    return result.data
      .sort((a, b) => a.index - b.index)
      .map((item) => item.embedding);
  }

  /**
   * Generate an embedding for a user question.
   *
   * Example:
   *
   * "How much does the Pro plan cost?"
   *
   * ↓
   *
   * [0.012, -0.384, ...]
   */
  async embedQuery(
    query: string
  ): Promise<number[]> {
    const cleanedQuery = query.trim();

    if (!cleanedQuery) {
      throw new Error(
        "Query cannot be empty"
      );
    }

    const vectors =
      await this.generateEmbeddings(
        [cleanedQuery],
        "query"
      );

    if (!vectors[0]) {
      throw new Error(
        "Embedding model returned no vector"
      );
    }

    return vectors[0];
  }

  /**
   * Generate embeddings for website chunks.
   *
   * Chunks are processed in batches so we
   * don't send hundreds of separate requests.
   */
  async embedDocuments(
    chunks: DocumentChunk[]
  ): Promise<EmbeddedChunk[]> {
    if (chunks.length === 0) {
      return [];
    }

    const embeddedChunks:
      EmbeddedChunk[] = [];

    /**
     * Process chunks batch by batch.
     *
     * Example:
     *
     * 45 chunks
     *
     * Batch 1 → 20
     * Batch 2 → 20
     * Batch 3 → 5
     */
    for (
      let index = 0;
      index < chunks.length;
      index += this.batchSize
    ) {
      const batch = chunks.slice(
        index,
        index + this.batchSize
      );

      const texts = batch.map(
        (chunk) => chunk.content
      );

      console.log(
        `🧠 Embedding batch ${
          Math.floor(
            index / this.batchSize
          ) + 1
        }`
      );

      const vectors =
        await this.generateEmbeddings(
          texts,
          "passage"
        );

      if (
        vectors.length !== batch.length
      ) {
        throw new Error(
          `Embedding count mismatch. Expected ${batch.length}, received ${vectors.length}`
        );
      }

      for (
        let batchIndex = 0;
        batchIndex < batch.length;
        batchIndex++
      ) {
        const chunk =
          batch[batchIndex];

        const vector =
          vectors[batchIndex];

        if (!vector) {
          throw new Error(
            `Missing embedding for chunk ${chunk.id}`
          );
        }

        embeddedChunks.push({
          id: chunk.id,

          content: chunk.content,

          vector,

          metadata: {
            ...chunk.metadata,
          },
        });
      }

      console.log(
        `✅ Embedded ${
          Math.min(
            index +
              this.batchSize,
            chunks.length
          )
        }/${chunks.length} chunks`
      );
    }

    return embeddedChunks;
  }

  /**
   * Useful for testing the model and
   * determining the vector dimension.
   *
   * We will use this before creating
   * our Qdrant collection.
   */
  async getEmbeddingDimension():
    Promise<number> {
    const vector =
      await this.embedQuery(
        "Embedding dimension test"
      );

    return vector.length;
  }
}

export default new EmbeddingService();