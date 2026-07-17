import { Request, Response } from "express";

import ragService from "../services/rag/rag.service";

class RAGController {
  /**
   * Temporary endpoint used to test
   * the complete RAG pipeline.
   */
  async testRAG(
    req: Request,
    res: Response
  ) {
    try {
      const {
        websiteId,
        question,
        retrievalLimit = 5,
        scoreThreshold,
        temperature,
        maxTokens,
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
          message: "websiteId is required",
        });
      }

      /**
       * Validate question.
       */
      if (
        !question ||
        typeof question !== "string" ||
        !question.trim()
      ) {
        return res.status(400).json({
          success: false,
          message: "Question is required",
        });
      }

      /**
       * Validate optional retrievalLimit.
       */
      if (
        typeof retrievalLimit !== "number" ||
        retrievalLimit <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "retrievalLimit must be a positive number",
        });
      }

      /**
       * Validate optional scoreThreshold.
       */
      if (
        scoreThreshold !== undefined &&
        typeof scoreThreshold !== "number"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "scoreThreshold must be a number",
        });
      }

      /**
       * Validate optional temperature.
       */
      if (
        temperature !== undefined &&
        typeof temperature !== "number"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "temperature must be a number",
        });
      }

      /**
       * Validate optional maxTokens.
       */
      if (
        maxTokens !== undefined &&
        (
          typeof maxTokens !== "number" ||
          maxTokens <= 0
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "maxTokens must be a positive number",
        });
      }

      console.log(
        "🧪 Starting RAG test..."
      );

      /**
       * Run the complete RAG pipeline.
       */
      const result =
        await ragService.ask(
          websiteId,
          question,
          {
            retrievalLimit,
            scoreThreshold,
            temperature,
            maxTokens,
          }
        );

      return res.status(200).json({
        success: true,

        message:
          "RAG pipeline completed successfully",

        data: result,
      });
    } catch (error) {
      console.error(
        "❌ RAG test failed:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to generate RAG answer",

        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      });
    }
  }
}

export default new RAGController();