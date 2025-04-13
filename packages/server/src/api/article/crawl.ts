import puppeteer, { Page } from "puppeteer";
import { connectDB } from "@/configs/mongodb";
import { ObjectId } from "mongodb";
import { parseToMongoDate } from "@/helper";
import { rabbitMQ, QUEUES } from "@/configs/rabbitmq";
import { jobModel } from "../jobs/jobs.model";
import { Job } from "@kltn/contract/api/article";
import { Router } from "express";
import stringSimilarity from "string-similarity";
import { configModel } from "@/api/remote-config/config.model";
import { WithId } from "mongodb";
import { similarArticleModel } from "./similar-articles.model";

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

async function getThresholds() {
  const config = await configModel.findOne({ key: "system" });
  return {
    matchingThreshold: config?.value?.string_matching_threshold || 0.95,
    notMatchingThreshold: config?.value?.string_not_matching_threshold || 0.2,
  };
}

async function findSimilarArticles(title: string, existingArticles: any[]) {
  const { matchingThreshold, notMatchingThreshold } = await getThresholds();

  const similarities = existingArticles.map((article) => ({
    article,
    similarity: stringSimilarity.compareTwoStrings(
      title.toLowerCase(),
      article.title.toLowerCase()
    ),
  }));

  const mostSimilar = similarities.reduce((prev, current) =>
    current.similarity > prev.similarity ? current : prev
  );

  return {
    similarity: mostSimilar.similarity,
    matchingArticle: mostSimilar.article,
    isMatch: mostSimilar.similarity >= matchingThreshold,
    isPotentialDuplicate:
      mostSimilar.similarity >= notMatchingThreshold &&
      mostSimilar.similarity < matchingThreshold,
  };
}

// TODO: fix type
async function handleArticleInsertion(
  article: any,
  existingArticles: any[],
  authorId: string
) {
  const { similarity, matchingArticle, isMatch, isPotentialDuplicate } =
    await findSimilarArticles(article.title, existingArticles);

  // console.log(
  //   `>>> Processing article: ${article.title} (similarity: ${similarity})`
  // );

  if (isMatch) {
    console.log(`>>>Article already exists: ${article.title}`);
    return {
      processedArticle: null,
      articleId: matchingArticle._id,
    };
  }

  // First insert as a new article
  const articleResult = await articleModel.insertOne({ ...article });
  const newArticleId = articleResult.insertedId;

  // If it's a potential duplicate, save to similarArticleModel
  if (isPotentialDuplicate) {
    // console.log(`>>>Potential duplicate found for: ${article.title}`);
    await similarArticleModel.insertOne({
      articleId: newArticleId,
      title: article.title,
      similarTo: {
        articleId: matchingArticle._id,
        title: matchingArticle.title,
        similarity,
      },
    });
  }

  return {
    processedArticle: { ...article, _id: newArticleId },
    articleId: newArticleId,
  };
}

export async function crawl(url: string, authorId: string) {
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();

  try {
    await page.goto(url + "&sortby=pubdate", { waitUntil: "networkidle2" });
    await clickShowmore(page);

    const articles = await page.evaluate(() => {
      return Array.from(document.querySelectorAll(".gsc_a_tr")).map(
        (article) => {
          const articleNode = article.childNodes[0].childNodes;
          return {
            title: articleNode[0].textContent,
            link: (articleNode[0] as HTMLAnchorElement).href,
          };
        }
      );
    });

    if (articles.length === 0) {
      throw new Error("No articles found");
    }

    // Fetch all existing articles once
    const existingArticles = await articleModel.find().toArray();

    const results = [];
    const articleIdsToAdd = [];

    console.log(`>>>Total articles: ${articles.length}`);
    for (const article of articles) {
      const enrichedArticle = await getMetadata(page, article);
      const { processedArticle, articleId } = await handleArticleInsertion(
        enrichedArticle,
        existingArticles,
        authorId
      );

      if (processedArticle) {
        results.push(processedArticle);
      }
      if (!articleId) {
        console.log(`>>>Article already exists: ${enrichedArticle.title}`);
      }
      if (articleId) {
        articleIdsToAdd.push(articleId);
      }
    }

    console.log(`>>>Total new articles: ${articleIdsToAdd.length}`);

    // Batch update author's articles list if there are new articles to add
    if (articleIdsToAdd.length > 0) {
      await authorModel.updateOne(
        { _id: new ObjectId(authorId) },
        { $set: { articles: articleIdsToAdd } }
      );
    }

    await browser.close();
    return results;
  } catch (error) {
    await browser.close();
    throw error;
  }
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
  const metadata = await page.evaluate(() => {
    const metadata: Record<any, any> = {};
    const data = document.querySelectorAll("#gsc_oci_table .gs_scl");
    data.forEach((item) => {
      const keyElement = item.querySelector(".gsc_oci_field");
      const valueElement = item.querySelector(".gsc_oci_value");
      if (keyElement && valueElement) {
        const key = keyElement.textContent.trim();
        let value: any = valueElement.textContent.trim();
        if (key === "Total citations") {
          const citedByElement = document.querySelector(".gsc_oci_value a");
          const citationCount = citedByElement
            ? parseInt(citedByElement.textContent.replace(/\D/g, ""), 10)
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

  return article;
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
