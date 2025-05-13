import { scheduledCrawlJob } from "./crawl-scholar-job";
import crawlScopusRouter from "./crawl-scopus-job";

scheduledCrawlJob.start();

export { crawlScopusRouter };
