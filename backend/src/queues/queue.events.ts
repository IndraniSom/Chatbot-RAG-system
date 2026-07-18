import { QueueEvents } from "bullmq";

import redis from "../config/redis";
import { QUEUES } from "./constant";

export const indexingQueueEvents =
  new QueueEvents(QUEUES.INDEXING, {
    connection: redis,
  });

indexingQueueEvents.on(
  "completed",
  ({ jobId }) => {
    console.log(
      `✅ Indexing job completed: ${jobId}`
    );
  }
);

indexingQueueEvents.on(
  "failed",
  ({ jobId, failedReason }) => {
    console.error(
      `❌ Indexing job failed: ${jobId}`
    );

    console.error(failedReason);
  }
);

indexingQueueEvents.on(
  "progress",
  ({ jobId, data }) => {
    console.log(
      `📈 Job ${jobId} progress`,
      data
    );
  }
);