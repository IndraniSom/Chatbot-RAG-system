import express from "express";
import { connectDatabase } from "../config/database";

import "./queue-events";
import "./indexing.worker";

const app = express();
const PORT = process.env.PORT || 10000;

app.get("/", (_, res) => {
  res.send("Scrappy Worker Running");
});

async function bootstrap() {
  await connectDatabase();
  console.log("🚀 Workers started...");

  app.listen(PORT, () => {
    console.log(`✅ Worker listening on ${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});