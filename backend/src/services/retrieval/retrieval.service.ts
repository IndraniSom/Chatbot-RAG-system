import embeddingService from "../embedding/embedding.service";

import qdrantService, {
  QdrantSearchResult,
} from "../vector/qdrant.service";

/**
 * Options that control retrieval.
 */
export interface RetrievalOptions {
  /**
   * Maximum number of chunks
   * we want from Qdrant.
   */
  limit?: number;

  /**
   * Optional minimum similarity score.
   *
   * Results below this score
   * will not be returned.
   */
  scoreThreshold?: number;
}

/**
 * Final result returned by
 * the retrieval pipeline.
 */
export interface RetrievalResult {
  question: string;

  websiteId: string;

  queryVectorDimension: number;

  chunks: QdrantSearchResult[];
}

class RetrievalService {
  /**
   * Main retrieval function.
   *
   * Question
   *    ↓
   * Query Embedding
   *    ↓
   * Qdrant Search
   *    ↓
   * Relevant Website Chunks
   */
  async retrieve(
    websiteId: string,
    question: string,
    options: RetrievalOptions = {}
  ): Promise<RetrievalResult> {
    /**
     * Validate website ID.
     */
    const cleanedWebsiteId =
      websiteId.trim();

    if (!cleanedWebsiteId) {
      throw new Error(
        "websiteId is required"
      );
    }

    /**
     * Validate question.
     */
    const cleanedQuestion =
      question.trim();

    if (!cleanedQuestion) {
      throw new Error(
        "Question cannot be empty"
      );
    }

    /**
     * Set retrieval configuration.
     */
    const limit =
      options.limit ?? 5;

    const scoreThreshold =
      options.scoreThreshold;

    console.log(
      `🔍 Retrieving context for website: ${cleanedWebsiteId}`
    );

    console.log(
      `❓ Question: ${cleanedQuestion}`
    );

    /**
     * STEP 1
     *
     * Convert the user's question
     * into an embedding.
     *
     * EmbeddingService uses:
     *
     * input_type = "query"
     */
    const queryVector =
      await embeddingService.embedQuery(
        cleanedQuestion
      );

    console.log(
      `🧠 Query embedding generated (${queryVector.length} dimensions)`
    );

    /**
     * STEP 2
     *
     * Search Qdrant using:
     *
     * Query Vector
     * +
     * websiteId Filter
     */
    const chunks =
      await qdrantService.search(
        queryVector,
        cleanedWebsiteId,
        limit,
        scoreThreshold
      );

    console.log(
      `📚 Retrieved ${chunks.length} relevant chunks`
    );

    /**
     * STEP 3
     *
     * Return the retrieved knowledge.
     *
     * Phase 9 will send these chunks
     * to the LLM as context.
     */
    return {
      question:
        cleanedQuestion,

      websiteId:
        cleanedWebsiteId,

      queryVectorDimension:
        queryVector.length,

      chunks,
    };
  }
}

export default new RetrievalService();