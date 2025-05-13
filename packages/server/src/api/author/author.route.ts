import { Router, Request } from "express";
import authorService from "./author.service";
import { z } from "zod";
import { authorModel, authorSchema } from "./author.model";
import validate, { validateObjectId } from "@/middlewares/validate.middleware";
import { initServer, TsRestRequest } from "@ts-rest/express";
import { authorContract } from "@kltn/contract";
import {
  AffiliationDocument,
  affiliationModel,
} from "../affiliation/affiliation.model";
import { ObjectId } from "mongodb";
import affiliationService from "../affiliation/affiliation.service";
// import { RequestWithUser } from "@/types/ts-rest";

// const router = Router();

// router.get("/authors", async (req, res) => {
//   const authors = await authorService.getAuthors();
//   res.json(authors);
// });

// router.get("/authors/:id", validateObjectId, async (req, res) => {
//   const author = await authorService.getAuthorById(req.params.id);
//   res.json(author);
// });

// router.post("/authors", validate(authorSchema), async (req, res) => {
//   // check if the request body is valid using zod
//   const author = await authorService.createAuthor(req.body);
//   res.json(author);
// });

// router.patch(
//   "/authors/:id",
//   validateObjectId,
//   validate(authorSchema.partial()),
//   async (req, res) => {
//     const author = await authorService.updateAuthor(req.params.id, req.body);
//     res.json(author);
//   }
// );

const s = initServer();
const router = s.router(authorContract, {
  getAuthors: async ({ req }) => {
    const reqAffiliation: AffiliationDocument = req["affiliation"];
    const permittedAffiliation =
      await affiliationService.getAffiliationWithDescendants(
        reqAffiliation._id
      );
    const permittedAuthorIds = permittedAffiliation.flatMap(
      (affiliation) => affiliation.authors
    );

    // console.log(">>> permittedAuthorIds:", permittedAuthorIds);

    const authors = await authorModel
      .find({ _id: { $in: permittedAuthorIds } })
      .toArray();
    for (const author of authors) {
      const affiliations = await affiliationModel
        .aggregate([
          {
            $graphLookup: {
              from: "affiliations",
              startWith: "$parent",
              connectFromField: "parent",
              connectToField: "_id",
              as: "hierarchy",
              depthField: "level",
            },
          },
          {
            $set: {
              hierarchy: {
                $sortArray: {
                  input: "$hierarchy",
                  sortBy: {
                    level: 1,
                  },
                },
              },
            },
          },
          {
            $match: {
              authors: {
                $in: [author._id],
              },
            },
          },
        ])
        .toArray();
      let affiliationsData = [];
      if (affiliations.length > 0) {
        affiliationsData.push(affiliations[0].name);
        for (const item of affiliations[0].hierarchy) {
          affiliationsData.push(item.name);
        }
      }
      author.affiliation = affiliationsData;
      author.articles =
        !author.articles || author.articles.length === 0 ? [] : author.articles;
    }

    return {
      status: 200,
      body: authors,
    };
  },

  createAuthor: async ({ req }) => {
    console.log(req.body);
    const author = await authorService.createAuthor(req["user"], req.body);
    return {
      status: 201,
      body: author,
    };
  },

  editAuthor: async ({ params, body }) => {
    console.log(body);

    const author = await authorService.updateAuthor(params.id, body);

    return {
      status: 200,
      body: author,
    };
  },

  deleteAuthor: async ({ params, req }) => {
    await authorService.deleteAuthor(req["user"], params.id);
    return {
      status: 200,
      body: { message: "Author deleted" },
    };
  },
});

export default router;
