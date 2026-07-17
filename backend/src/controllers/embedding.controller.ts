import { Request, Response } from "express";
import embeddingService from "../services/embedding/embedding.service";

class EmbeddingController {
  async testEmbedding(req: Request, res: Response) {
    try {
      const { text } = req.body;

      /**
       * Validate input
       */
      if (
        !text ||
        typeof text !== "string" ||
        !text.trim()
      ) {
        return res.status(400).json({
          success: false,
          message: "Text is required",
        });
      }

      console.log(
        `🧠 Generating embedding for: "${text}"`
      );

      /**
       * Generate query embedding
       */
      const vector =
        await embeddingService.embedQuery(text);

      console.log(
        `✅ Embedding generated`
      );

      console.log(
        `📐 Vector dimension: ${vector.length}`
      );

      /**
       * Return the result
       */
      return res.status(200).json({
        success: true,

        data: {
          text,

          dimension: vector.length,

          vector,
        },
      });
    } catch (error) {
      console.error(
        "❌ Embedding generation failed:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to generate embedding",

        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      });
    }
  }
}

export default new EmbeddingController();