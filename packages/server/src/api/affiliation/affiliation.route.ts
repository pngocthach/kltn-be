import { Request, Router } from "express";
import affiliationService from "./affiliation.service";
import validate, { validateObjectId } from "@/middlewares/validate.middleware";
import {
  Affiliation,
  AffiliationDocument,
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
import { auth } from "@/utils/auth";
import { userModel } from "../user/user.model";
import { transformObjectId } from "@/helper/transform-objectId.helper";

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

  getAffiliations: async ({ req }) => {
    const reqAffiliation: AffiliationDocument = req["affiliation"];
    const affiliations = await affiliationService.getAffiliationWithDescendants(
      reqAffiliation._id
    );

    return {
      status: 200,
      body: affiliations,
    };
  },

  createAffiliation: async ({ body }) => {
    const affiliation = await affiliationModel.insertOne({
      name: body.name,
      parent: body.parent ? transformObjectId(body.parent) : undefined,
      users: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    if (body.admin) {
      const admin = await auth.api.createUser({
        email: body.admin.email,
        password: body.admin.password,
        name: body.admin.name || body.admin.email,
      });
      await affiliationModel.findOneAndUpdate(
        { _id: affiliation.insertedId },
        { $addToSet: { users: transformObjectId(admin.user.id) } },
        { returnDocument: "after" }
      );
    }
    return {
      status: 201,
      body: affiliation,
    };
  },

  editAffiliation: async ({ params, body }) => {
    if (body.admins) {
      // update user
      for (const admin of body.admins) {
        let user = await userModel.findOne({ email: admin.email });
        if (!user) {
          const newUser = await auth.api.createUser({
            email: admin.email,
            password: admin.password,
            name: admin.name || admin.email,
          });
          await affiliationModel.updateOne(
            { _id: new ObjectId(params.id) },
            { $addToSet: { users: transformObjectId(newUser.user.id) } }
          );
        }
        if (user) {
          // remove from other affiliations
          await affiliationModel.updateMany(
            { users: user._id },
            { $pull: { users: user._id } }
          );
          await affiliationModel.updateOne(
            { _id: transformObjectId(params.id) },
            { $addToSet: { users: user._id } }
          );
        }
      }
    }

    const affiliation = await affiliationModel.updateOne(
      { _id: transformObjectId(params.id) },
      {
        $set: {
          name: body.name,
          parent: body.parent ? transformObjectId(body.parent) : undefined,
        },
      }
    );
    return {
      status: 200,
      body: affiliation,
    };
  },

  deleteAffiliation: async ({ params }) => {
    // Delete the affiliation and all its children
    const result = await affiliationModel.deleteMany({
      $or: [
        { _id: new ObjectId(params.id) },
        { parent: new ObjectId(params.id) },
      ],
    });

    return {
      status: 200,
      body: {
        message: "Affiliation and its children deleted successfully",
      },
    };
  },
});

export default router;
