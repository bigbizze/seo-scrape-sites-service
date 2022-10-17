
import { ScrapeSiteJobEnqueue, ScrapeSiteResult } from "../types";
import { siteRequestCache } from "../utils/site-request-cache";
import { updateApiDb } from "../update-api-db";
import { getDefaultScrapeSiteResult } from "../parsers";
import { onTaskSuccessFn, processTaskFn } from "./index";

export type ProcessCreateSiteJobFn = (params: ScrapeSiteJobEnqueue) => (Promise<ScrapeSiteResult> | ScrapeSiteResult);
export type OnJobSuccessFn = (params: ScrapeSiteResult) => Promise<void>;

export interface TaskProcessor {
  addJobs(
    scrapeSite: ScrapeSiteJobEnqueue[]
  ): Promise<void>
}

class TaskQueue {
  private async doJob(data: ScrapeSiteJobEnqueue) {
    const result = await processTaskFn(data);
    await onTaskSuccessFn(result);
    if (
      !!result.needs.length
      || data.website !== result.website
      || data.isWordpress !== result.isWordpress
    ) {
      await updateApiDb(result);
    }
  }
  private async awaitOrError() {
    await new Promise(r => setTimeout(r, 120 * 1000));
    throw new Error("Timeout");
  }
  async enqueue(data: ScrapeSiteJobEnqueue) {
    try {
      await Promise.race([
        this.doJob(data),
        this.awaitOrError()
      ]);
    } catch (e) {
      console.error(e);
      await onTaskSuccessFn(getDefaultScrapeSiteResult(data));
    } finally {
      siteRequestCache.removeSite(data.placeId);
    }
  }
}
export const makeTaskProcessor = async (): Promise<TaskProcessor> => {
  const taskQueue = new TaskQueue();
  return {
    async addJobs(
      scrapeSite: ScrapeSiteJobEnqueue[]
    ) {
      await new Promise(r => setTimeout(r, 3000));
      for (const data of scrapeSite) {
        taskQueue.enqueue(data)
          .catch(console.error);
      }
    }
  }
};

if (require.main === module) {
  // makeTasks()
  //   .catch(console.error);
}
