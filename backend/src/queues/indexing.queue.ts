import { Queue } from "bullmq";

import redisConnection from "../config/redis";

import { QUEUES, JOBS } from "./constant";

export interface IndexWebsiteJobData {
  websiteId: string;
  maxPages?: number;
}

const indexingQueue =
  new Queue<IndexWebsiteJobData>(
    QUEUES.INDEXING,
    {
      connection: redisConnection,

      defaultJobOptions: {
        attempts: 3,

        backoff: {
          type: "exponential",
          delay: 3000,
        },

        removeOnComplete: 100,

        removeOnFail: 100,
      },
    }
  );



export default indexingQueue;