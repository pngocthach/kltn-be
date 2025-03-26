import { CronJob } from "cron";
import { connectDB } from "@/configs/mongodb";
import { ObjectId } from "mongodb";
import { differenceInDays } from "date-fns";
import { QUEUES, rabbitMQ } from "@/configs/rabbitmq";

const db = await connectDB();
const authorModel = db.collection("authors");
const jobModel = db.collection("jobs");

export const scheduledCrawlJob = new CronJob(
  "0 0 * * *", // Run at midnight every day
  async function () {
    console.log("Checking authors for scheduled crawls...");

    try {
      const authors = await authorModel
        .find({
          schedule: { $exists: true, $ne: null },
        })
        .toArray();

      const now = new Date();

      for (const author of authors) {
        const createdAt = author.createdAt || author._id.getTimestamp();
        const daysSinceCreation = differenceInDays(now, createdAt);

        if (daysSinceCreation % author.schedule === 0) {
          console.log(`Creating crawl job for author: ${author.name}`);

          const job = await jobModel.insertOne({
            type: "crawl_scholar",
            url: author.scholarUrl,
            authorId: new ObjectId(author._id),
            status: "pending",
            createdAt: new Date(),
          });

          await rabbitMQ.sendToQueue(QUEUES.CRAWL_SCHOLAR, {
            jobId: job.insertedId.toString(),
          });
          console.log(`Job queued for author: ${author.name}`);
        }
      }
    } catch (error) {
      console.error("Error in scheduled crawl job:", error);
    }
  },
  null,
  true,
  "Asia/Ho_Chi_Minh"
);
