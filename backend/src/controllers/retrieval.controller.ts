import { Request, Response } from "express";

import retrievalService from "../services/retrieval/retrieval.service";

class RetrievalController {
  async testRetrieval(
    req: Request,
    res: Response
  ) {
    try {
      /**
       * Get data from request body.
       */
      const {
        websiteId,
        question,
        limit = 5,
        scoreThreshold,
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
       * Validate limit.
       */
      if (
        typeof limit !== "number" ||
        limit <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "limit must be a positive number",
        });
      }

      /**
       * Validate optional score threshold.
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

      console.log(
        "🔍 Starting retrieval test..."
      );

      console.log(
        `🌐 Website ID: ${websiteId}`
      );

      console.log(
        `❓ Question: ${question}`
      );

      /**
       * Run the complete retrieval pipeline.
       */
      const result =
        await retrievalService.retrieve(
          websiteId,
          question,
          {
            limit,
            scoreThreshold,
          }
        );

      /**
       * Return retrieved chunks.
       */
      return res.status(200).json({
        success: true,

        message:
          "Retrieval completed successfully",

        data: {
          websiteId:
            result.websiteId,

          question:
            result.question,

          queryVectorDimension:
            result.queryVectorDimension,

          resultsFound:
            result.chunks.length,

          chunks:
            result.chunks,
        },
      });
    } catch (error) {
      console.error(
        "❌ Retrieval failed:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to retrieve website context",

        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      });
    }
  }
}

export default new RetrievalController();