import { Worker } from "bullmq";

import redisConnection from "../config/redis";

import { QUEUES } from "../queues/constant";

import indexingJob from "../jobs/indexing.job";

const indexingWorker = new Worker(
  QUEUES.INDEXING,
  async (job) => {
    return indexingJob.execute(job);
  },
  {
    connection: redisConnection,
    concurrency: 2,
  }
);

// indexingWorker.on(
//   "completed",
//   (job) => {
//     console.log(
//       `✅ Job ${job.id} completed`
//     );
//   }
// );

// indexingWorker.on(
//   "failed",
//   (job, error) => {
//     console.error(
//       `❌ Job ${job?.id} failed`,
//       error
//     );
//   }
// );

indexingWorker.on(
  "error",
  (error) => {
    console.error(
      "Worker Error",
      error
    );
  }
);
// indexingWorker.on(
//   "failed",
//   (job, error) => {
//     console.log(
//       `Retry ${
//         job?.attemptsMade
//       }`
//     );
//   }
// );

export default indexingWorker;