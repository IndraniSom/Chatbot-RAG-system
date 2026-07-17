import { Request, Response } from "express";

import ragService from "../services/rag/rag.service";

class ChatController {
  /**
   * Main production chatbot endpoint.
   *
   * POST /api/chat
   */
  async chat(
    req: Request,
    res: Response
  ) {
    try {
      const {
        websiteId,
        message,
      } = req.body;

      /**
       * Validate websiteId.
       */
      if (
        !websiteId ||
        typeof websiteId !== "string" ||
        !websiteId.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "websiteId is required",
        });
      }

      /**
       * Validate user message.
       */
      if (
        !message ||
        typeof message !== "string" ||
        !message.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Message is required",
        });
      }

      console.log(
        `💬 Chat request for website: ${websiteId}`
      );

      /**
       * Run the RAG pipeline.
       *
       * We control these settings on
       * the server instead of allowing
       * public chatbot users to change them.
       */
      const result =
        await ragService.ask(
          websiteId,
          message,
          {
            retrievalLimit: 5,

            /**
             * Leave threshold undefined
             * initially.
             *
             * Tune this later using real
             * retrieval evaluation data.
             */
            scoreThreshold:
              undefined,

            /**
             * Low temperature gives more
             * consistent RAG answers.
             */
            temperature: 0.2,

            maxTokens: 1000,
          }
        );

      /**
       * Return a frontend-friendly response.
       */
      return res.status(200).json({
        success: true,

        data: {
          answer:
            result.answer,

          sources:
            result.sources,
        },
      });
    } catch (error) {
      console.error(
        "❌ Chat request failed:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to generate chatbot response",

        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      });
    }
  }
}

export default new ChatController();