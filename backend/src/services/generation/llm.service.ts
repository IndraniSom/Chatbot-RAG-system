/**
 * One source of website knowledge
 * retrieved from Qdrant.
 */
export interface LLMContextSource {
  content: string;

  metadata: {
    url: string;
    title: string;
  };
}

/**
 * Options for controlling generation.
 */
export interface LLMGenerationOptions {
  temperature?: number;
  maxTokens?: number;
}

/**
 * Structure returned by the NVIDIA
 * Chat Completions API.
 */
interface NVIDIAChatResponse {
  id?: string;

  model?: string;

  choices: Array<{
    index: number;

    message: {
      role: string;
      content: string | null;
    };

    finish_reason?: string | null;
  }>;

  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
}

/**
 * Final result returned by LLMService.
 */
export interface LLMGenerationResult {
  answer: string;

  model?: string;

  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}

class LLMService {
  private readonly apiKey: string;

  private readonly apiUrl: string;

  private readonly model: string;

  constructor() {
    this.apiKey =
      process.env.NVIDIA_API_KEY || "";

    this.apiUrl =
      process.env.NVIDIA_LLM_URL ||
      "https://integrate.api.nvidia.com/v1/chat/completions";

    this.model =
      process.env.NVIDIA_LLM_MODEL ||
      "nvidia/nemotron-3-ultra-550b-a55b";

    if (!this.apiKey) {
      console.warn(
        "⚠️ NVIDIA_API_KEY is not configured"
      );
    }
  }

  /**
   * Convert Qdrant chunks into structured
   * context for the LLM.
   *
   * Example:
   *
   * [Source 1]
   * Title: Pricing
   * URL: https://example.com/pricing
   *
   * The Pro plan costs $20 per month.
   */
  private buildContext(
    sources: LLMContextSource[]
  ): string {
    return sources
      .map((source, index) => {
        return [
          `[Source ${index + 1}]`,
          `Title: ${source.metadata.title}`,
          `URL: ${source.metadata.url}`,
          "",
          source.content,
        ].join("\n");
      })
      .join("\n\n---\n\n");
  }

  /**
   * Generate an answer using the user's
   * question and retrieved website context.
   */
  async generateAnswer(
    question: string,
    sources: LLMContextSource[],
    options: LLMGenerationOptions = {}
  ): Promise<LLMGenerationResult> {
    /**
     * Validate API key.
     */
    if (!this.apiKey) {
      throw new Error(
        "NVIDIA_API_KEY is not configured"
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
     * If retrieval found nothing,
     * don't waste an LLM API request.
     */
    if (sources.length === 0) {
      return {
        answer:
          "I couldn't find enough information on this website to answer that question.",
      };
    }

    /**
     * Convert retrieved chunks into
     * structured context.
     */
    const context =
      this.buildContext(sources);

    /**
     * Keep temperature low for RAG.
     *
     * We want grounded answers,
     * not creative answers.
     */
    const temperature =
      options.temperature ?? 0.2;

    const maxTokens =
      options.maxTokens ?? 1000;

    console.log(
      `🤖 Sending question to ${this.model}`
    );

    /**
     * Call NVIDIA's OpenAI-compatible
     * Chat Completions endpoint.
     */
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

          messages: [
            /**
             * System message controls
             * the chatbot's behaviour.
             */
            {
              role: "system",

              content: `
You are Scrappy, an AI assistant for a website.

Your job is to answer the user's question using the website context provided to you.

Rules:

1. Use the provided website context as your source of truth.

2. Do not invent facts that are not supported by the context.

3. If the context does not contain enough information to answer the question, clearly say that you could not find enough information on the website.

4. Keep the answer clear, helpful, and concise.

5. Do not mention embeddings, vectors, Qdrant, retrieval systems, RAG, or internal implementation details.

6. Do not claim that you performed actions you cannot actually perform.

7. If multiple sources contain useful information, combine them into one coherent answer.
              `.trim(),
            },

            /**
             * Website knowledge retrieved
             * from Qdrant.
             */
            {
              role: "user",

              content: `
WEBSITE CONTEXT:

${context}
              `.trim(),
            },

            /**
             * Actual user question.
             */
            {
              role: "user",

              content: `
USER QUESTION:

${cleanedQuestion}

Answer the question using the website context above.
              `.trim(),
            },
          ],

          temperature,

          max_tokens: maxTokens,

          stream: false,
        }),
      }
    );

    /**
     * Handle NVIDIA API errors.
     */
    if (!response.ok) {
      const errorBody =
        await response.text();

      throw new Error(
        `NVIDIA LLM API failed: ${response.status} ${response.statusText} - ${errorBody}`
      );
    }

    const result =
      (await response.json()) as NVIDIAChatResponse;

    /**
     * Extract generated answer.
     */
    const answer =
      result.choices?.[0]?.message?.content?.trim();

    if (!answer) {
      throw new Error(
        "NVIDIA LLM returned an empty answer"
      );
    }

    console.log(
      "✅ Nemotron answer generated"
    );

    return {
      answer,

      model:
        result.model,

      usage:
        result.usage
          ? {
              promptTokens:
                result.usage.prompt_tokens,

              completionTokens:
                result.usage.completion_tokens,

              totalTokens:
                result.usage.total_tokens,
            }
          : undefined,
    };
  }
}

export default new LLMService();