import { connectDB } from "@/configs/mongodb";
import fs from "fs/promises";
import stringSimilarity from "string-similarity";
import { configModel } from "@/api/remote-config/config.model";

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
console.log("threshold:", await getThresholds());

async function readScopusData(): Promise<ScopusArticle[]> {
  try {
    const data = await fs.readFile("data/scopus_data.json", "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading scopus_data.json:", error);
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

async function updateArticlesWithScopusIndex() {
  console.log("Starting Scopus index check...");

  const scopusArticles = await readScopusData();
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
                    // title: similarScopusArticle["dc:title"],
                    // doi: similarScopusArticle["prism:doi"],
                    // publicationName:
                    //   similarScopusArticle["prism:publicationName"],
                    // coverDate: similarScopusArticle["prism:coverDate"],
                    // citationCount: parseInt(
                    //   similarScopusArticle["citedby-count"],
                    //   10
                    // ),
                    // affiliations: similarScopusArticle.affiliation.map(
                    //   (aff) => ({
                    //     name: aff.affilname,
                    //     city: aff["affiliation-city"],
                    //     country: aff["affiliation-country"],
                    //   })
                    // ),
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

  console.log(`
    Scopus index check completed:
    - Total articles processed: ${articles.length}
    - Articles updated: ${updatedCount}
    - Scopus matches found: ${matchCount}
  `);
}

// Run the update
import express from "express";

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

export default router;

// Example usage in your main app file:
// import scopusCheckRouter from './scopus-check';
// app.use('/api', scopusCheckRouter);
