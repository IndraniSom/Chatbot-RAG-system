export const QUEUES = {
  INDEXING: "indexing",
} as const;

export const JOBS = {
  INDEX_WEBSITE: "index-website",
} as const;
export const QUEUE_OPTIONS = {
  attempts: 3,
  backoff: {
    type: "exponential",
    delay: 3000,
  },
  removeOnComplete: 100,
  removeOnFail: 100,
} as const;