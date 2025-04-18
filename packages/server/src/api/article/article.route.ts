import { articleContract } from "@kltn/contract";
import { initServer } from "@ts-rest/express";
import { connectDB } from "@/configs/mongodb";
import { createCrawlJob } from "./crawl";
import { transformObjectId } from "@/helper/transform-objectId.helper";
import { AffiliationDocument } from "../affiliation/affiliation.model";
import affiliationService from "../affiliation/affiliation.service";
import { authorModel } from "../author/author.model";
import { ObjectId } from "mongodb";
import queryString from "query-string";

const db = await connectDB();
const articleModel = db.collection("article");

const s = initServer();
const router = s.router(articleContract, {
  getArticles: async ({ req }) => {
    const query = queryString.parse(req.url.split("?")[1], {
      arrayFormat: "index",
    });

    const reqAffiliation: AffiliationDocument = req["affiliation"];
    let { permittedAffiliation, permittedAuthorIds } =
      await affiliationService.getPermittedAffiliation(reqAffiliation._id);

    if (query.affiliations?.length) {
      permittedAffiliation = permittedAffiliation.filter((affiliation) =>
        query.affiliations.includes(affiliation._id.toString())
      );
    }

    if (query.authors?.length) {
      permittedAuthorIds = permittedAuthorIds.filter((authorId) =>
        query.authors.includes(authorId.toString())
      );
    }

    const authors = await authorModel
      .find({ _id: { $in: permittedAuthorIds } })
      .toArray();

    // Build the base query
    const baseQuery: any = {
      _id: {
        $in: authors.flatMap((author) => author.articles),
      },
    };

    // Add date filtering if provided
    if (query.startDate || query.endDate) {
      const dateFilter: any = {
        $or: [
          // Handle ISODate format
          {
            "metadata.Publication date": {
              ...(query.startDate && {
                $gte: new Date(query.startDate as string),
              }),
              ...(query.endDate && { $lte: new Date(query.endDate as string) }),
            },
          },
          // Handle string format
          {
            "metadata.Publication date": {
              ...(query.startDate && { $gte: query.startDate as string }),
              ...(query.endDate && { $lte: query.endDate as string }),
            },
          },
        ],
      };

      Object.assign(baseQuery, dateFilter);
    }

    // Debug log
    console.log("MongoDB Query:", JSON.stringify(baseQuery, null, 2));

    // Execute the query
    let articles = await articleModel.find(baseQuery).toArray();

    // Debug log
    console.log("Found articles:", articles.length);
    if (articles.length > 0) {
      console.log(
        "Sample article publication date:",
        articles[0].metadata["Publication date"]
      );
    }

    // Apply search filter if provided
    if (query.search) {
      const searchLower = (query.search as string).toLowerCase();
      articles = articles.filter(
        (article) =>
          article.title.toLowerCase().includes(searchLower) ||
          article.metadata.Authors.toLowerCase().includes(searchLower)
      );
    }

    return {
      status: 200,
      body: articles,
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

  getArticle: async ({ params }) => {
    const article = await articleModel.findOne({
      _id: transformObjectId(params.id),
    });

    if (!article) {
      return {
        status: 404,
        body: null,
      };
    }

    return {
      status: 200,
      body: article,
    };
  },
});

export default router;
