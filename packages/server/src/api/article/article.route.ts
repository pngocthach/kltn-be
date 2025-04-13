import { articleContract } from "@kltn/contract";
import { initServer } from "@ts-rest/express";
import { connectDB } from "@/configs/mongodb";
import { createCrawlJob } from "./crawl";
import { transformObjectId } from "@/helper/transform-objectId.helper";
import { AffiliationDocument } from "../affiliation/affiliation.model";
import affiliationService from "../affiliation/affiliation.service";
import { authorModel } from "../author/author.model";
import { ObjectId } from "mongodb";

const db = await connectDB();
const articleModel = db.collection("article");
const affiliationModel = db.collection("affiliations");

const s = initServer();
const router = s.router(articleContract, {
  getArticles: async ({ req }) => {
    const reqAffiliation: AffiliationDocument = req["affiliation"];
    const permittedAffiliation =
      await affiliationService.getAffiliationWithDescendants(
        reqAffiliation._id
      );
    const permittedAuthorIds = permittedAffiliation.flatMap(
      (affiliation) => affiliation.authors
    );
    const authors = await authorModel
      .find({ _id: { $in: permittedAuthorIds } })
      .toArray();
    const articleSet: Set<ObjectId> = new Set();
    authors.forEach((author) => {
      author.articles &&
        author.articles.forEach((articleId) => {
          articleSet.add(transformObjectId(articleId));
        });
    });

    return {
      status: 200,
      body: await articleModel
        .find({ _id: { $in: Array.from(articleSet) } })
        .toArray(),
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
