import { connectDB } from "@/configs/mongodb";
import fs from "fs/promises";
import stringSimilarity from "string-similarity";
import { configModel } from "@/api/remote-config/config.model";
import { crawlScopusByYear, crawlScopusByYears } from "./crawl-scopus-job";
import express, { Request, Response } from "express";

const db = await connectDB();
const articleModel = db.collection("article");

interface ScopusArticle {
  "dc:title": string;
  "dc:creator": string;
  "prism:coverDate": string;
  "prism:doi"?: string;
  "dc:identifier": string;
  "citedby-count": string;
  "prism:publicationName": string;
  affiliation: Array<{
    affilname: string;
    "affiliation-city": string;
    "affiliation-country": string;
  }>;
}

async function getThresholds() {
  const config = await configModel.findOne({ key: "system" });
  return {
    matchingThreshold: config?.value?.string_matching_threshold || 0.95,
  };
}

console.log("Starting Scopus check...");
console.log(">>> threshold:", await getThresholds());

async function readScopusData(): Promise<ScopusArticle[]> {
  try {
    // Fetch the current year by default, or customize as needed
    const year = new Date().getFullYear();
    const data = await crawlScopusByYear(year);
    return data as ScopusArticle[];
  } catch (error) {
    console.error("Error fetching Scopus data:", error);
    return [];
  }
}

async function findSimilarScopusArticle(
  title: string,
  scopusArticles: ScopusArticle[]
) {
  const { matchingThreshold } = await getThresholds();

  const similarities = scopusArticles.map((article) => ({
    article,
    similarity: stringSimilarity.compareTwoStrings(
      title.toLowerCase(),
      article["dc:title"].toLowerCase()
    ),
  }));

  const mostSimilar = similarities.reduce((prev, current) =>
    current.similarity > prev.similarity ? current : prev
  );

  return mostSimilar.similarity >= matchingThreshold
    ? mostSimilar.article
    : null;
}

async function updateArticlesWithScopusIndex(scopusArticles?: ScopusArticle[]) {
  console.log("Starting Scopus index check...");

  if (!scopusArticles) {
    scopusArticles = await readScopusData();
  }
  if (!scopusArticles.length) {
    console.error("No Scopus data available");
    return;
  }
  console.log(`Loaded ${scopusArticles.length} Scopus articles`);

  const articles = await articleModel.find().toArray();
  console.log(`Found ${articles.length} articles to check`);

  let updatedCount = 0;
  let matchCount = 0;

  for (const article of articles) {
    try {
      const similarScopusArticle = await findSimilarScopusArticle(
        article.title,
        scopusArticles
      );

      const isScopusIndex = !!similarScopusArticle;

      // Only update if the field doesn't exist or has changed
      if (article.isScopusIndex !== isScopusIndex) {
        await articleModel.updateOne(
          { _id: article._id },
          {
            $set: {
              isScopusIndex,
              lastScopusCheck: new Date(),
              scopusMatchDetails: isScopusIndex
                ? {
                    scopusId: similarScopusArticle["dc:identifier"].replace(
                      "SCOPUS_ID:",
                      ""
                    ),
                    checkedAt: new Date(),
                  }
                : null,
            },
          }
        );
        updatedCount++;
        if (isScopusIndex) matchCount++;
      }
    } catch (error) {
      console.error(`Error processing article ${article._id}:`, error);
    }
  }

  console.log(
    `\n    Scopus index check completed:\n    - Total articles processed: ${articles.length}\n    - Articles updated: ${updatedCount}\n    - Scopus matches found: ${matchCount}\n  `
  );
}

// Run the update
const router = express.Router();

router.get("/run-scopus-check", async (req, res) => {
  try {
    await updateArticlesWithScopusIndex();
    res
      .status(200)
      .json({ message: "Scopus index check completed successfully" });
  } catch (error) {
    console.error("Error during Scopus index check:", error);
    res.status(500).json({ error: "Error during Scopus index check" });
  }
});

router.post("/run-scopus-crawl", async (req: Request, res: Response) => {
  try {
    const mode = req.body.mode as string;
    let years: number[] = [];

    if (mode === "all") {
      const startYear = 2000; // or your desired start year
      const endYear = new Date().getFullYear();
      years = Array.from(
        { length: endYear - startYear + 1 },
        (_, i) => startYear + i
      );
    } else if (mode === "current") {
      years = [new Date().getFullYear()];
    } else if (mode === "year" && Array.isArray(req.body.year)) {
      years = (req.body.year as (string | number)[]).map((y) =>
        typeof y === "string" ? parseInt(y, 10) : y
      );
    } else if (req.body.years) {
      years = (req.body.year as (string | number)[]).map((y) =>
        typeof y === "string" ? parseInt(y, 10) : y
      );
    } else {
      res.status(400).json({ error: "Invalid mode or years parameter" });
      return;
    }

    const results = await crawlScopusByYears(years);
    res.status(200).json({
      message: `Crawled ${results.length} results for years: ${years.join(
        ", "
      )}`,
      years,
      results,
    });
  } catch (error) {
    console.error("Error during Scopus crawl:", error);
    res.status(500).json({ error: "Error during Scopus crawl" });
  }
});

router.post(
  "/run-scopus-crawl-and-check",
  async (req: Request, res: Response) => {
    try {
      const mode = req.body.mode as string;
      let years: number[] = [];

      if (mode === "all") {
        const startYear = 2000; // or your desired start year
        const endYear = new Date().getFullYear();
        years = Array.from(
          { length: endYear - startYear + 1 },
          (_, i) => startYear + i
        );
      } else if (mode === "current") {
        years = [new Date().getFullYear()];
      } else if (mode === "year" && req.body.year) {
        years = [parseInt(req.body.year as string)];
      } else if (req.body.years) {
        years = (req.body.years as string).split(",").map(Number);
      } else {
        res.status(400).json({ error: "Invalid mode or years parameter" });
        return;
      }

      // Crawl and then update
      const scopusArticles = await crawlScopusByYears(years);
      await updateArticlesWithScopusIndex(scopusArticles as ScopusArticle[]);
      res.status(200).json({
        message: `Crawled and checked articles for years: ${years.join(", ")}`,
        years,
        count: scopusArticles.length,
      });
    } catch (error) {
      console.error("Error during Scopus crawl and check:", error);
      res.status(500).json({ error: "Error during Scopus crawl and check" });
    }
  }
);

export default router;

// Example usage in your main app file:
// import scopusCheckRouter from './scopus-check';
// app.use('/api', scopusCheckRouter);
