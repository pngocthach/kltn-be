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
import { affiliationModel } from "../affiliation/affiliation.model";
import affiliationMongodb from "../affiliation/repository/affiliation.mongodb";

const db = await connectDB();
const articleModel = db.collection("article");

const s = initServer();
const router = s.router(articleContract, {
  getArticles: async ({ req }) => {
    const query = queryString.parse(req.url.split("?")[1], {
      arrayFormat: "index",
    });

    const reqAffiliation: AffiliationDocument = req["affiliation"];

    // Get current affiliation and all its descendants
    const allAffiliations =
      await affiliationService.getAffiliationWithDescendants(
        reqAffiliation._id
      );

    let permittedAuthorIds: ObjectId[] = [];

    // Filter by selected affiliations if any, otherwise use all permitted affiliations
    if (query.affiliations?.length) {
      const selectedAffiliations = Array.isArray(query.affiliations)
        ? query.affiliations
        : [query.affiliations];

      // selectedAffiliations.push(reqAffiliation._id.toString());
      const selectedAffiliationDocs =
        await affiliationMongodb.getFilteredAffiliations(selectedAffiliations);

      // Get all authors from selected affiliations
      permittedAuthorIds = selectedAffiliationDocs
        .flatMap((aff) => aff.authors || [])
        .map((id) => new ObjectId(id.toString()));
    } else {
      // If no affiliations selected, use all authors from current and descendant affiliations
      permittedAuthorIds = allAffiliations
        .flatMap((aff) => aff.authors || [])
        .map((id) => new ObjectId(id.toString()));
    }

    // Filter by selected authors if any
    if (query.authors?.length) {
      const selectedAuthors = Array.isArray(query.authors)
        ? query.authors
        : [query.authors];

      permittedAuthorIds = permittedAuthorIds.filter((authorId) =>
        selectedAuthors.includes(authorId.toString())
      );
    }

    // Get all authors
    const authors = await authorModel
      .find({ _id: { $in: permittedAuthorIds } })
      .toArray();

    // Build the base query
    const baseQuery: any = {
      _id: {
        $in: authors.flatMap((author) => author.articles || []),
      },
    };

    // Add date filtering if provided
    if (query.startDate || query.endDate) {
      const dateFilter: any = {
        $or: [
          {
            "metadata.Publication date": {
              ...(query.startDate && {
                $gte: new Date(query.startDate as string),
              }),
              ...(query.endDate && { $lte: new Date(query.endDate as string) }),
            },
          },
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

    // Debug logs
    console.log("Query params:", query);

    // Execute the query
    let articles = await articleModel.find(baseQuery).toArray();

    console.log("Found articles count:", articles.length);

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
