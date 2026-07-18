import { Job } from "bullmq";

import websiteIndexingService from "../services/indexing/website-indexing.service";

export interface IndexWebsiteJobData {
  websiteId: string;
  maxPages?: number;
}

class IndexingJob {
  async execute(
    job: Job<IndexWebsiteJobData>
  ) {
    const {
      websiteId,
      maxPages = 20,
    } = job.data;

    console.log(
      `🚀 Processing website ${websiteId}`
    );

    await job.updateProgress(5);

    const result =
      await websiteIndexingService.indexWebsite(
        websiteId,
        {
          maxPages,
        }
      );

    await job.updateProgress(100);

    return result;
  }
}

export default new IndexingJob();