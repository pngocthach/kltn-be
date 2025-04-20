import createHttpError from "http-errors";
import {
  AffiliationDocument,
  Affiliation,
  affiliationModel,
} from "../affiliation.model";
import { AffiliationRepo } from "./affiliation.repo";
import { ObjectId } from "mongodb";
import { transformObjectId } from "@/helper/transform-objectId.helper";
import { AffWithHierarchyDto } from "../dto/aff-with-hierachy.dto";

class AffiliationMongoDbRepo implements AffiliationRepo {
  async getAll(): Promise<AffiliationDocument[]> {
    return affiliationModel
      .aggregate<AffiliationDocument>([
        {
          $lookup: {
            from: "user",
            localField: "users",
            foreignField: "_id",
            as: "userDetails",
          },
        },
        {
          $set: {
            users: "$userDetails",
          },
        },
        {
          $unset: "userDetails",
        },
      ])
      .toArray();
  }

  async getAllWithHierarchy(): Promise<AffWithHierarchyDto[]> {
    return await affiliationModel
      .aggregate<AffWithHierarchyDto>([
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
                  level: -1,
                },
              },
            },
          },
        },
      ])
      .toArray();
  }

  async getOneWithHierarchy(id: string): Promise<AffWithHierarchyDto | null> {
    return await affiliationModel
      .aggregate<AffWithHierarchyDto>([
        {
          $match: {
            _id: new ObjectId(id),
          },
        },
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
                  level: -1,
                },
              },
            },
          },
        },
      ])
      .next();
  }

  async getById(id: string): Promise<AffiliationDocument | null> {
    return await affiliationModel
      .aggregate<AffiliationDocument>([
        {
          $match: {
            _id: new ObjectId(id),
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
      .match({ _id: new ObjectId(id) })
      .next();
  }

  async create(affiliation: Affiliation): Promise<AffiliationDocument> {
    affiliation.createdAt = new Date();
    affiliation.updatedAt = new Date();
    this.transformId(affiliation);
    const result = await affiliationModel.insertOne(affiliation);
    return { ...affiliation, _id: result.insertedId };
  }

  async update(
    id: string,
    affiliation: Partial<Affiliation>
  ): Promise<AffiliationDocument | undefined> {
    affiliation.updatedAt = new Date();
    this.transformId(affiliation as Affiliation);
    const result = await affiliationModel.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { ...affiliation, updatedAt: new Date() } },
      { returnDocument: "after" }
    );
    if (!result) {
      throw new createHttpError.NotFound();
    }
    return result;
  }

  async delete(id: string): Promise<AffiliationDocument | null> {
    return affiliationModel.findOneAndDelete({ _id: new ObjectId(id) });
  }

  private transformId(affiliation: Affiliation) {
    if (affiliation.users) {
      affiliation.users = affiliation.users.map((user) =>
        transformObjectId(user)
      );
    }
    if (affiliation.authors) {
      affiliation.authors = affiliation.authors.map((author) =>
        transformObjectId(author)
      );
    }
    if (affiliation.parent) {
      affiliation.parent = transformObjectId(affiliation.parent);
    }
  }

  async getFilteredAffiliations(filteredAffiliations: string[]) {
    const result = affiliationModel
      .aggregate([
        {
          $match: {
            _id: {
              $in: filteredAffiliations.map((aff) => transformObjectId(aff)),
            },
          },
        },
        {
          $graphLookup: {
            from: "affiliations",
            startWith: "$_id",
            connectFromField: "_id",
            connectToField: "parent",
            as: "descendants",
          },
        },
        {
          $project: {
            allAffiliations: {
              $concatArrays: [["$$ROOT"], "$descendants"],
            },
          },
        },
        {
          $unwind: "$allAffiliations",
        },
        {
          $replaceRoot: { newRoot: "$allAffiliations" },
        },
      ])
      .toArray();

    return result;
  }

  async getAllUsersInAffiliation(id: string): Promise<string[] | undefined> {
    const doc = await affiliationModel
      .aggregate([
        {
          $match: {
            _id: new ObjectId(id),
          },
        },
        {
          $lookup: {
            from: "affiliations",
            let: {
              parentId: "$parent",
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$_id", "$$parentId"],
                  },
                },
              },
            ],
            as: "parent",
          },
        },
        {
          $project: {
            users: 1,
            parentUsers: {
              $arrayElemAt: ["$parent.users", 0],
            },
          },
        },
        {
          $project: {
            allUsers: {
              $setUnion: ["$users", "$parentUsers"],
            },
          },
        },
      ])
      .next();

    if (!doc) {
      throw new createHttpError.NotFound();
    }

    return doc.allUsers.map((user: any) => user.toString());
  }
}

export default new AffiliationMongoDbRepo();
