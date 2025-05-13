import { QUEUES, rabbitMQ } from "@/configs/rabbitmq";
import { crawl } from "./crawl";
import { authorModel } from "@/api/author/author.model";
import { ObjectId } from "mongodb";
import { jobModel } from "../jobs/jobs.model";

export async function startConsumer() {
  await rabbitMQ.consumeQueue(QUEUES.CRAWL_SCHOLAR, async (message) => {
    const { jobId } = message;
    if (!jobId) {
      throw new Error("Invalid message format: missing jobId");
    }
    console.log(">>> jobId:", jobId);

    const job = await jobModel.findOneAndUpdate(
      { _id: new ObjectId(jobId) },
      { $set: { status: "processing" } },
      { returnDocument: "after" }
    );

    if (!job) {
      throw new Error("Job not found");
    }

    if (job.type === "crawl_scopus") {
      console.log("Crawling Scopus...");
      await jobModel.updateOne(
        { _id: new ObjectId(jobId) },
        { $set: { status: "completed", completedAt: new Date() } }
      );
      return;
    } else if (job.type === "crawl_scholar") {
      const { url, authorId } = job;
      console.log(`Processing crawl for: ${url}`);

      try {
        const articles = await crawl(url, authorId);
        const articleIds = articles.map((article) => article["_id"]);

        await authorModel.updateOne(
          { _id: new ObjectId(authorId) },
          { $addToSet: { articles: { $each: articleIds } } }
        );

        console.log(`Crawling done for ${url}`);
        await jobModel.updateOne(
          { _id: new ObjectId(jobId) },
          { $set: { status: "completed", completedAt: new Date() } }
        );
      } catch (error) {
        console.error(`Error processing jobId=${jobId}, url=${url}:`, error);
        await jobModel.updateOne(
          { _id: new ObjectId(jobId) },
          {
            $set: {
              status: "failed",
              error: error.message,
              errorStack: error.stack,
            },
          }
        );
        throw error; // This will trigger the nack
      }
    }
  });

  console.log("RabbitMQ consumers started...");
}
