import "dotenv/config";

import app from "./app";

import {
  connectDatabase,
} from "./config/database";

const PORT =
  process.env.PORT || 5000;

const startServer =
  async () => {
    /**
     * Connect to MongoDB first.
     */
    await connectDatabase();

    /**
     * Only start Express after
     * database connection succeeds.
     */
    app.listen(
      PORT,
      () => {
        console.log(
          "================================="
        );

        console.log(
          "🚀 Scrappy AI Backend Started"
        );

        console.log(
          `🌐 Server running on http://localhost:${PORT}`
        );

        console.log(
          "================================="
        );
      }
    );
  };

startServer();