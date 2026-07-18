import { connectDatabase } from "../config/database";

import "./queue-events";
import "./indexing.worker";

/**
 * The worker is a separate Node process. It must establish its own Mongo
 * connection — otherwise the first Mongoose query from a job will fall
 * into Mongoose's "buffering" mode and time out after 10s with
 * `Operation websites.findOne() buffering timed out`.
 */
async function bootstrap() {
  await connectDatabase();
  console.log("🚀 Workers started...");
}

bootstrap().catch((err) => {
  console.error("❌ Worker bootstrap failed:", err);
  process.exit(1);
});