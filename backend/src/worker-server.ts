import "dotenv/config";

import express from "express";

import { connectDatabase } from "./config/database";
import { connectRedis } from "./config/redis";

// Start BullMQ Worker
import "./worker";

const app = express();

const PORT = process.env.PORT || 10000 || 5000;

app.get("/", (_, res) => {
  res.status(200).send("Scrappy Worker Running 🚀");
});

async function bootstrap() {
  try {
    console.log("🚀 Starting Scrappy Worker...");

    await connectDatabase();
    await connectRedis();

    app.listen(PORT, () => {
      console.log(`✅ Worker listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Worker failed to start");
    console.error(error);
    process.exit(1);
  }
}

bootstrap();

process.on("SIGINT", async () => {
  process.exit(0);
});

process.on("SIGTERM", async () => {
  process.exit(0);
});