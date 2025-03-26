import puppeteer, { Page } from "puppeteer";
import { connectDB } from "@/configs/mongodb";
import { ObjectId, WithId } from "mongodb";
import { parseToMongoDate } from "@/helper";
import { rabbitMQ, QUEUES } from "@/configs/rabbitmq";
import { jobModel } from "../jobs/jobs.model";
import { Job } from "@kltn/contract/api/article";
import { Router } from "express";

const db = await connectDB();
const articleModel = db.collection("article");
const authorModel = db.collection("authors");

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function clickShowmore(page: Page) {
  while (true) {
    const isDisabled = await page.evaluate(() => {
      const button = document.querySelector("#gsc_bpf_more");
      return button ? (button as HTMLButtonElement).disabled : true;
    });

    if (isDisabled) break; // Dừng khi nút bị disable

    console.log("Clicking 'Show more'...");
    await page.click("#gsc_bpf_more");
    await sleep(2000);
  }
}

export async function crawl(url: string) {
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  let articles = [];

  await page.goto(url + "&sortby=pubdate", { waitUntil: "networkidle2" });

  await clickShowmore(page);

  articles = await page.evaluate(() => {
    return Array.from(document.querySelectorAll(".gsc_a_tr")).map((article) => {
      const articleNode = article.childNodes[0].childNodes;
      return {
        title: articleNode[0].textContent,
        link: (articleNode[0] as HTMLAnchorElement).href,
      };
    });
  });

  const result = [];
  for (const article of articles) {
    const res = await getMetadata(page, article);
    result.push(res);
  }

  return result;
}

async function getMetadata(
  page: Page,
  article: {
    link: string;
    title: string;
    metadata?: Record<any, any>;
  }
) {
  await page.goto(article.link);
  // @ts-ignore
  const metadata = await page.evaluate(() => {
    const metadata: Record<any, any> = {};
    const data = document.querySelectorAll("#gsc_oci_table .gs_scl");
    data.forEach((item) => {
      const keyElement = item.querySelector(".gsc_oci_field");
      const valueElement = item.querySelector(".gsc_oci_value");
      if (keyElement && valueElement) {
        // @ts-ignore
        const key = keyElement.textContent.trim();
        // @ts-ignore
        let value: any = valueElement.textContent.trim();
        if (key === "Total citations") {
          const citedByElement = document.querySelector(".gsc_oci_value a");
          const citationCount = citedByElement
            ? // @ts-ignore
              parseInt(citedByElement.textContent.replace(/\D/g, ""), 10)
            : 0;
          value = citationCount;
        }
        metadata[key] = value;
      }
    });
    return metadata;
  });

  article.metadata = metadata;
  if (article.metadata["Publication date"]) {
    article.metadata["Publication date"] = parseToMongoDate(
      article.metadata["Publication date"]
    );
  }
  const upsertArticle = await articleModel.findOneAndReplace(
    { title: article.title },
    article,
    {
      upsert: true,
    }
  );
  console.log("Inserted article", upsertArticle);
  return upsertArticle;
}

const router = Router();

// router.post("/crawl", async (req, res) => {
//   const url = req.body.url;
//   const authorId = new ObjectId(req.body.authorId);
//   const articles = await crawl(url);
//   // @ts-ignore
//   const articleIds = articles.map((article) => article["_id"]);
//   await authorModel.updateOne(
//     { _id: authorId },
//     { $addToSet: { articles: { $each: articleIds } } }
//   );

//   res.json(articles);
// });

let channelInstance;

export function setChannel(channel) {
  channelInstance = channel;
}

// @ts-ignore
router.post("/crawl", async (req, res) => {
  const { url, authorId } = req.body;
  if (!url || !authorId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  if (!channelInstance) {
    return res.status(500).json({ error: "RabbitMQ not initialized" });
  }

  const job = await jobModel.insertOne({
    type: "crawl_scholar",
    url,
    authorId: new ObjectId(authorId),
    status: "pending",
    createdAt: new Date(),
  });

  await rabbitMQ.sendToQueue(channelInstance, {
    jobId: job.insertedId.toString(),
  });
  res.json({
    _id: job.insertedId,
    type: "crawl_scholar",
    url,
    authorId: new ObjectId(authorId),
    status: "pending",
    createdAt: new Date(),
  });
});

export async function createCrawlJob(
  url: string,
  authorId: string
): Promise<WithId<Job>> {
  if (!url || !authorId) {
    throw new Error("Missing required fields");
  }

  const job = await jobModel.insertOne({
    type: "crawl_scholar",
    url,
    authorId: new ObjectId(authorId),
    status: "pending",
    createdAt: new Date(),
  });

  try {
    await rabbitMQ.sendToQueue(QUEUES.CRAWL_SCHOLAR, {
      jobId: job.insertedId.toString(),
    });

    return {
      _id: job.insertedId,
      type: "crawl_scholar",
      url,
      authorId: new ObjectId(authorId),
      status: "pending",
      createdAt: new Date(),
    };
  } catch (error) {
    // If queue fails, update job status to failed
    await jobModel.updateOne(
      { _id: job.insertedId },
      { $set: { status: "failed", error: "Failed to queue job" } }
    );

    throw new Error("Failed to queue job");
  }
}

export default router;
