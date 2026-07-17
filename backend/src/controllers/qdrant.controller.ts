import { Request, Response } from "express";

import qdrantService from "../services/vector/qdrant.service";

class QdrantController {
  async testQdrant(
    req: Request,
    res: Response
  ) {
    try {
      console.log(
        "🔍 Testing Qdrant connection..."
      );

      /**
       * Test connection.
       */
      const isConnected =
        await qdrantService.healthCheck();

      if (!isConnected) {
        return res.status(503).json({
          success: false,

          message:
            "Could not connect to Qdrant Cloud",
        });
      }

      /**
       * Check collection.
       */
      const collectionExists =
        await qdrantService.collectionExists();

      /**
       * Get information if collection exists.
       */
      const collectionInfo =
        collectionExists
          ? await qdrantService
              .getCollectionInfo()
          : null;

      return res.status(200).json({
        success: true,

        message:
          "Successfully connected to Qdrant Cloud",

        data: {
          connected: true,

          collection: {
            name:
              process.env
                .QDRANT_COLLECTION ||
              "scrappy_knowledge",

            exists:
              collectionExists,

            info:
              collectionInfo,
          },
        },
      });
    } catch (error) {
      console.error(
        "❌ Qdrant test failed:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to test Qdrant connection",

        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      });
    }
  }
}

export default new QdrantController();