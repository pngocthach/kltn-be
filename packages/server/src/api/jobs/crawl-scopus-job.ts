import axios from "axios";
import { configModel } from "@/api/remote-config/config.model";

const SCOPUS_API_URL = "https://api.elsevier.com/content/search/scopus";
const API_KEY = process.env.SCOPUS_API_KEY;

// Month group queries
const MONTH_GROUPS = [
  'PUBDATETXT("Jan*") OR PUBDATETXT("Feb*") OR PUBDATETXT("Mar*")',
  'PUBDATETXT("Apr*") OR PUBDATETXT("May*") OR PUBDATETXT("Jun*")',
  'PUBDATETXT("Jul*") OR PUBDATETXT("Aug*") OR PUBDATETXT("Sep*")',
  'PUBDATETXT("Oct*") OR PUBDATETXT("Nov*") OR PUBDATETXT("Dec*")',
];
const NOT_MONTHS = [
  'NOT PUBDATETXT("Jan*")',
  'NOT PUBDATETXT("Feb*")',
  'NOT PUBDATETXT("Mar*")',
  'NOT PUBDATETXT("Apr*")',
  'NOT PUBDATETXT("May*")',
  'NOT PUBDATETXT("Jun*")',
  'NOT PUBDATETXT("Jul*")',
  'NOT PUBDATETXT("Aug*")',
  'NOT PUBDATETXT("Sep*")',
  'NOT PUBDATETXT("Oct*")',
  'NOT PUBDATETXT("Nov*")',
  'NOT PUBDATETXT("Dec*")',
].join(" AND ");

async function getDefaultQuery(): Promise<string> {
  const config = await configModel.findOne({ key: "system" });
  return config?.value?.scopus_default_query || "";
}

function buildQuery(year: number, extraQuery: string, defaultQuery: string) {
  let base = `AFFILCOUNTRY(\"Viet nam\") AND PUBYEAR IS ${year}`;
  if (extraQuery) base += ` AND (${extraQuery})`;
  if (defaultQuery) base += ` AND (${defaultQuery})`;
  return base;
}

async function getResultsCount(query: string) {
  const res = await axios.get(SCOPUS_API_URL, {
    headers: {
      Accept: "application/json",
      "X-ELS-APIKey": API_KEY,
    },
    params: {
      query,
      count: 0,
    },
  });
  return parseInt(
    res.data["search-results"]["opensearch:totalResults"] || "0",
    10
  );
}

async function crawlQuery(query: string, maxResults = 2000) {
  let start = 0;
  const count = 25;
  let results: any[] = [];
  while (true) {
    const res = await axios.get(SCOPUS_API_URL, {
      headers: {
        Accept: "application/json",
        "X-ELS-APIKey": API_KEY,
      },
      params: {
        query,
        start,
        count,
      },
    });
    const entries = res.data["search-results"].entry || [];
    results = results.concat(entries);
    if (entries.length < count || results.length >= maxResults) break;
    start += count;
    await new Promise((r) => setTimeout(r, 500)); // Rate limit
  }
  return results;
}

export async function crawlScopusByYear(year: number) {
  const defaultQuery = await getDefaultQuery();
  const baseQuery = buildQuery(year, "", defaultQuery);
  const total = await getResultsCount(baseQuery);
  if (total <= 2000) {
    return await crawlQuery(baseQuery);
  } else {
    let allResults: any[] = [];
    for (const group of MONTH_GROUPS) {
      const q = buildQuery(year, group, defaultQuery);
      const count = await getResultsCount(q);
      if (count > 0) {
        allResults = allResults.concat(await crawlQuery(q));
      }
    }
    // Optionally handle NOT_MONTHS for leftovers
    const q = buildQuery(year, NOT_MONTHS, defaultQuery);
    const count = await getResultsCount(q);
    if (count > 0) {
      allResults = allResults.concat(await crawlQuery(q));
    }
    return allResults;
  }
}

export async function crawlScopusByYears(years: number[]) {
  let allResults: any[] = [];
  for (const year of years) {
    const results = await crawlScopusByYear(year);
    allResults = allResults.concat(results);
  }
  return allResults;
}

// Express route for manual trigger
import express from "express";
const router = express.Router();

router.get("/run-scopus-crawl", async (req, res) => {
  try {
    const year = parseInt(req.query.year as string) || new Date().getFullYear();
    const results = await crawlScopusByYear(year);
    res.status(200).json({
      message: `Crawled ${results.length} results for year ${year}`,
      results,
    });
  } catch (error) {
    console.error("Error during Scopus crawl:", error);
    res.status(500).json({ error: "Error during Scopus crawl" });
  }
});

export default router;
