import retrievalService from "../retrieval/retrieval.service";
import llmService, {
  LLMContextSource,
} from "../generation/llm.service";

/**
 * Options for controlling the RAG pipeline.
 */
export interface RAGOptions {
  /**
   * Number of relevant chunks
   * to retrieve from Qdrant.
   */
  retrievalLimit?: number;

  /**
   * Optional minimum similarity score.
   */
  scoreThreshold?: number;

  /**
   * Controls LLM creativity.
   *
   * Lower values are usually better
   * for grounded RAG answers.
   */
  temperature?: number;

  /**
   * Maximum number of tokens
   * the LLM can generate.
   */
  maxTokens?: number;
}

/**
 * Source returned to the frontend.
 */
export interface RAGSource {
  title: string;
  url: string;

  /**
   * Highest similarity score associated
   * with this source.
   */
  score: number;
}

/**
 * Final result returned by RAGService.
 */
export interface RAGResult {
  websiteId: string;

  question: string;

  answer: string;

  sources: RAGSource[];

  metadata: {
    retrievedChunks: number;
    queryVectorDimension: number;
    model?: string;

    usage?: {
      promptTokens?: number;
      completionTokens?: number;
      totalTokens?: number;
    };
  };
}

class RAGService {
  /**
   * Remove duplicate sources.
   *
   * Multiple chunks may come from the
   * same website page.
   *
   * Example:
   *
   * Chunk 1 → /pricing
   * Chunk 2 → /pricing
   * Chunk 3 → /faq
   *
   * We only want:
   *
   * /pricing
   * /faq
   */
  private buildUniqueSources(
    chunks: Awaited<
      ReturnType<
        typeof retrievalService.retrieve
      >
    >["chunks"]
  ): RAGSource[] {
    const sourceMap =
      new Map<string, RAGSource>();

    for (const chunk of chunks) {
      const url =
        chunk.metadata.url;

      /**
       * Skip chunks without a URL.
       */
      if (!url) {
        continue;
      }

      const existingSource =
        sourceMap.get(url);

      /**
       * If this URL has not been
       * added yet, store it.
       */
      if (!existingSource) {
        sourceMap.set(url, {
          title:
            chunk.metadata.title ||
            url,

          url,

          score:
            chunk.score,
        });

        continue;
      }

      /**
       * If another chunk from the
       * same page has a higher score,
       * keep the higher score.
       */
      if (
        chunk.score >
        existingSource.score
      ) {
        sourceMap.set(url, {
          ...existingSource,

          score:
            chunk.score,
        });
      }
    }

    return Array.from(
      sourceMap.values()
    ).sort(
      (a, b) =>
        b.score - a.score
    );
  }

  /**
   * Main RAG pipeline.
   *
   * Question
   *    ↓
   * RetrievalService
   *    ↓
   * Query Embedding
   *    ↓
   * Qdrant Search
   *    ↓
   * Relevant Chunks
   *    ↓
   * LLMService
   *    ↓
   * Nemotron
   *    ↓
   * Grounded Answer
   */
  async ask(
    websiteId: string,
    question: string,
    options: RAGOptions = {}
  ): Promise<RAGResult> {
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

    console.log(
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    );

    console.log(
      "🤖 Starting RAG pipeline"
    );

    console.log(
      `🌐 Website: ${cleanedWebsiteId}`
    );

    console.log(
      `❓ Question: ${cleanedQuestion}`
    );

    /**
     * --------------------------------
     * STEP 1
     * Retrieve relevant knowledge
     * --------------------------------
     */

    console.log(
      "🔍 Step 1: Retrieving website knowledge..."
    );

    const retrievalResult =
      await retrievalService.retrieve(
        cleanedWebsiteId,
        cleanedQuestion,
        {
          limit:
            options.retrievalLimit ??
            5,

          scoreThreshold:
            options.scoreThreshold,
        }
      );

    console.log(
      `📚 Found ${retrievalResult.chunks.length} relevant chunks`
    );

    /**
     * --------------------------------
     * STEP 2
     * Handle empty retrieval
     * --------------------------------
     *
     * If Qdrant finds nothing,
     * don't call the LLM.
     */

    if (
      retrievalResult.chunks.length ===
      0
    ) {
      console.log(
        "⚠️ No relevant website context found"
      );

      return {
        websiteId:
          cleanedWebsiteId,

        question:
          cleanedQuestion,

        answer:
          "I couldn't find enough information on this website to answer that question.",

        sources: [],

        metadata: {
          retrievedChunks: 0,

          queryVectorDimension:
            retrievalResult
              .queryVectorDimension,
        },
      };
    }

    /**
     * --------------------------------
     * STEP 3
     * Prepare context for LLM
     * --------------------------------
     */

    console.log(
      "📝 Step 2: Preparing LLM context..."
    );

    const llmSources:
      LLMContextSource[] =
        retrievalResult.chunks.map(
          (chunk) => ({
            content:
              chunk.content,

            metadata: {
              url:
                chunk.metadata.url,

              title:
                chunk.metadata.title,
            },
          })
        );

    /**
     * --------------------------------
     * STEP 4
     * Generate answer
     * --------------------------------
     */

    console.log(
      "🧠 Step 3: Generating answer..."
    );

    const generationResult =
      await llmService.generateAnswer(
        cleanedQuestion,
        llmSources,
        {
          temperature:
            options.temperature,

          maxTokens:
            options.maxTokens,
        }
      );

    /**
     * --------------------------------
     * STEP 5
     * Build unique source list
     * --------------------------------
     */

    const sources =
      this.buildUniqueSources(
        retrievalResult.chunks
      );

    console.log(
      `🔗 Returning ${sources.length} unique sources`
    );

    console.log(
      "✅ RAG pipeline completed"
    );

    console.log(
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    );

    /**
     * --------------------------------
     * STEP 6
     * Return final result
     * --------------------------------
     */

    return {
      websiteId:
        cleanedWebsiteId,

      question:
        cleanedQuestion,

      answer:
        generationResult.answer,

      sources,

      metadata: {
        retrievedChunks:
          retrievalResult
            .chunks.length,

        queryVectorDimension:
          retrievalResult
            .queryVectorDimension,

        model:
          generationResult.model,

        usage:
          generationResult.usage,
      },
    };
  }
}

export default new RAGService();