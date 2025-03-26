import { articleContract } from "@kltn/contract";
import { initServer } from "@ts-rest/express";
import { connectDB } from "@/configs/mongodb";
import { createCrawlJob } from "./crawl";

const db = await connectDB();
const articleModel = db.collection("article");
const authorModel = db.collection("authors");
const affiliationModel = db.collection("affiliations");

const s = initServer();
const router = s.router(articleContract, {
  getArticles: async () => {
    return {
      status: 200,
      body: await articleModel.find().toArray(),
    };
  },

  crawl: async ({ body }) => {
    try {
      const job = await createCrawlJob(body.url, body.authorId);
      return {
        status: 201,
        body: job,
      };
    } catch (error) {
      return {
        status: 400,
        body: { error: error.message },
      };
    }
  },
});

export default router;
