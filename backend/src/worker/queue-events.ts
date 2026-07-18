import { QueueEvents } from "bullmq";

import redisConnection from "../config/redis";

import { QUEUES } from "../queues/constant";

const queueEvents = new QueueEvents(
  QUEUES.INDEXING,
  {
    connection: redisConnection,
  }
);

queueEvents.on(
  "completed",
  ({ jobId }) => {
    console.log(
      `✅ Job ${jobId} completed`
    );
  }
);

queueEvents.on(
  "failed",
  ({ jobId, failedReason }) => {
    console.error(
      `❌ Job ${jobId} failed`
    );

    console.error(failedReason);
  }
);

queueEvents.on(
  "progress",
  ({ jobId, data }) => {
    console.log(
      `📊 ${jobId}: ${data}%`
    );
  }
);

export default queueEvents;