import puppeteer, { Page } from "puppeteer";
import { connectDB } from "@/database/mongodb";
import { Router } from "express";
// Or import puppeteer from 'puppeteer-core';
import { ObjectId } from "mongodb";

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

async function crawl(url: string) {
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

  // const promises = [];
  // for (const article of articles) {
  //   promises.push(getMetadata(page, article));
  // }
  // await Promise.all(promises);
  // const results = await Promise.all(promises);
  // articles = results.flat();

  const result = [];
  for (const article of articles) {
    const res = await getMetadata(page, article);
    result.push(res);
  }

  return result;
}

async function getMetadata(
  page: Page,
  article: { link: string; metadata?: Record<string, string | number> }
) {
  await page.goto(article.link);
  const metadata = await page.evaluate(() => {
    const metadata: Record<string, string | number> = {};
    const data = document.querySelectorAll("#gsc_oci_table .gs_scl");
    data.forEach((item) => {
      const keyElement = item.querySelector(".gsc_oci_field");
      const valueElement = item.querySelector(".gsc_oci_value");
      if (keyElement && valueElement) {
        // @ts-ignore
        const key = keyElement.textContent.trim();
        // @ts-ignore
        let value: string | number = valueElement.textContent.trim();
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
  await articleModel.insertOne(article);
  console.log("Inserted article", article);
  return article;
}

const router = Router();

router.post("/crawl", async (req, res) => {
  const url = req.body.url;
  const authorId = new ObjectId(req.body.authorId);
  const articles = await crawl(url);
  // @ts-ignore
  const articleIds = articles.map((article) => article["_id"]);
  await authorModel.updateOne(
    { _id: authorId },
    { $addToSet: { articles: { $each: articleIds } } }
  );

  res.json(articles);
});

export default router;
