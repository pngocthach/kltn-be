import { Request, Router } from "express";
import affiliationService from "./affiliation.service";
import validate, { validateObjectId } from "@/middlewares/validate.middleware";
import {
  Affiliation,
  affiliationModel,
  affiliationSchema,
} from "./affiliation.model";
import { AddUsersToAffiliationDto } from "./dto/add-users-to-aff.dto";
import checkAffiliationPermission from "./middlewares/check-aff-permission.middleware";
import { AuthenticatedRequest } from "@/middlewares/auth.middleware";
import { User } from "better-auth/types";
import { affiliationContract } from "@kltn/contract";
import { initServer } from "@ts-rest/express";
import { connectDB } from "@/configs/mongodb";
import { ObjectId } from "mongodb";
// import

// const router = Router();

// router.get("/", async (req, res) => {
//   const affiliations = await affiliationService.getAll();
//   res.json(affiliations);
// });

// router.get("/:id", async (req, res) => {
//   const affiliation = await affiliationService.getById(req.params.id);
//   res.json(affiliation);
// });

// router.post(
//   "/",
//   validate(affiliationSchema),
//   async (req: AuthenticatedRequest, res, next) => {
//     await affiliationService.checkAffiliationPermission(
//       req.body.parent,
//       req.user
//     );
//     const affiliation = await affiliationService.create(req.body);
//     res.status(201).json(affiliation);
//   }
// );

// router.post(
//   "/:id/users",
//   validate(AddUsersToAffiliationDto),
//   async (req, res) => {
//     const affiliation = await affiliationService.addUserToAffiliation(
//       req.params.id,
//       req.body
//     );
//     res.json(affiliation);
//   }
// );

// router.patch("/:id", async (req, res) => {
//   const affiliation = await affiliationService.update(req.params.id, req.body);
//   res.json(affiliation);
// });

// router.delete("/:id", async (req, res) => {
//   const affiliation = await affiliationService.delete(req.params.id);
//   res.json(affiliation);
// });

const s = initServer();
const router = s.router(affiliationContract, {
  getAffiliation: async ({ params }) => {
    const affiliation = await affiliationModel
      .aggregate([
        {
          $match: {
            _id: new ObjectId(params.id),
          },
        },
        {
          $graphLookup: {
            from: "affiliations",
            startWith: "$_id",
            connectFromField: "_id",
            connectToField: "parent",
            as: "children",
          },
        },
        {
          $lookup: {
            from: "authors",
            localField: "authors",
            foreignField: "_id",
            as: "currentAuthors",
          },
        },
        {
          $lookup: {
            from: "authors",
            localField: "children.authors",
            foreignField: "_id",
            as: "childrenAuthors",
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            users: 1,
            children: 1,
            authors: {
              $concatArrays: ["$currentAuthors", "$childrenAuthors"],
            },
          },
        },
      ])
      .match({ _id: new ObjectId(params.id) })
      .next();

    return {
      status: 200,
      body: affiliation,
    };
  },

  // @ts-ignore
  getRawAffiliations: async () => {
    return {
      status: 200,
      body: await affiliationModel.find().toArray(),
    };
  },

  getAffiliations: async () => {
    return {
      status: 200,
      body: await affiliationModel
        .aggregate([
          {
            $lookup: {
              from: "affiliations",
              localField: "parent",
              foreignField: "_id",
              as: "parent",
            },
          },
          {
            $set: {
              parent: {
                $arrayElemAt: ["$parent", 0],
              },
            },
          },
        ])
        .toArray(),
    };
  },

  createAffiliation: async ({ body }) => {
    const affiliation = await affiliationModel.insertOne(body);
    if (body.admin) {
    }
    return {
      status: 201,
      body: affiliation,
    };
  },
});

export default router;
