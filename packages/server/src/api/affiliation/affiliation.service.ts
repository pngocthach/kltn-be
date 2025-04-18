import { User } from "better-auth/types";
import {
  Affiliation,
  AffiliationDocument,
  affiliationModel,
} from "./affiliation.model";
import affiliationMongodb from "./repository/affiliation.mongodb";
import { AffiliationRepo } from "./repository/affiliation.repo";
import { AddUsersToAffiliationDto } from "./dto/add-users-to-aff.dto";
import createHttpError from "http-errors";
import { ObjectId } from "mongodb";
import { auth } from "@/utils/auth";
import { CreateAffiliationDto } from "@kltn/contract/api/affiliation";
import { transformObjectId } from "@/helper/transform-objectId.helper";

class AffiliationService {
  private affiliationRepo: AffiliationRepo;

  constructor() {
    this.affiliationRepo = affiliationMongodb;
  }

  async getAll(): Promise<AffiliationDocument[]> {
    return this.affiliationRepo.getAll();
  }

  async getById(id: string): Promise<AffiliationDocument | null> {
    const affiliationData = await this.affiliationRepo.getById(id);
    if (!affiliationData) {
      throw createHttpError.NotFound("Affiliation not found");
    }
    return affiliationData;
  }

  // async create(dto: CreateAffiliationDto): Promise<AffiliationDocument> {
  //   const affiliation: Affiliation = {
  //     name: dto.name,
  //     parent: dto.parent ? new ObjectId(dto.parent) : undefined,
  //     users: [],
  //     createdAt: new Date(),
  //     updatedAt: new Date(),
  //   };

  //   // If admin details are provided, create a new user
  //   if (dto.admin?.email) {
  //     let user;

  //     if (dto.admin.password) {
  //       // Create user with password
  //       user = await auth.createUser({
  //         email: dto.admin.email,
  //         password: dto.admin.password,
  //         name: dto.admin.name || dto.admin.email,
  //       });
  //     } else {
  //       // Create user without password (will trigger email invitation)
  //       user = await auth.inviteUser({
  //         email: dto.admin.email,
  //         name: dto.admin.name || dto.admin.email,
  //       });
  //     }

  //     affiliation.users = [new ObjectId(user.id)];
  //   }

  //   return this.affiliationRepo.create(affiliation);
  // }

  async addUserToAffiliation(
    affiliationId: string,
    dto: AddUsersToAffiliationDto
  ): Promise<AffiliationDocument | undefined> {
    const affiliation = await this.affiliationRepo.getById(affiliationId);
    if (!affiliation) {
      throw new Error("Affiliation not found");
    }
    if (!affiliation.users) {
      affiliation.users = [];
    }
    affiliation.users.push(...dto.users);
    // remove duplicates
    affiliation.users = Array.from(
      new Set(affiliation.users.map((u) => u.toString()))
    );
    return this.affiliationRepo.update(affiliationId, affiliation);
  }

  async update(
    id: string,
    Affiliation: Partial<Affiliation>
  ): Promise<AffiliationDocument | undefined> {
    return this.affiliationRepo.update(id, Affiliation);
  }

  async delete(id: string): Promise<AffiliationDocument | null> {
    return this.affiliationRepo.delete(id);
  }

  async getAllUsersInAffiliation(id: string): Promise<string[] | undefined> {
    return this.affiliationRepo.getAllUsersInAffiliation(id);
  }

  async getAffiliationWithDescendants(id: string | ObjectId) {
    return affiliationModel
      .aggregate([
        // 1. Match the starting document
        {
          $match: {
            _id: transformObjectId(id), // _id of "UET"
          },
        },

        // 2. Use $graphLookup to find ALL descendants recursively
        {
          $graphLookup: {
            from: "affiliations",
            startWith: "$_id",
            connectFromField: "_id",
            connectToField: "parent",
            as: "all_descendants_temp",
            // maxDepth: 10, // Optional depth limit
            // "depthField": "level" // Optional depth field
          },
        },

        // 3. Create a single array containing the root and all descendants
        {
          $project: {
            root_doc: {
              _id: "$_id",
              name: "$name",
              parent: "$parent",
              users: "$users", // Keep original user IDs for now
              createdAt: "$createdAt",
              updatedAt: "$updatedAt",
              authors: "$authors", // Keep original author IDs for now
            },
            descendant_docs: "$all_descendants_temp",
          },
        },
        {
          $project: {
            _id: 0,
            allItems: {
              $concatArrays: [["$root_doc"], "$descendant_docs"],
            },
          },
        },

        // 4. Unwind the combined array
        {
          $unwind: "$allItems",
        },

        // 5. Promote each item to the root
        {
          $replaceRoot: { newRoot: "$allItems" },
        },

        // 6. Lookup IMMEDIATE children for the 'descendants' field
        {
          $lookup: {
            from: "affiliations",
            localField: "_id",
            foreignField: "parent",
            as: "immediate_children",
          },
        },

        // ***** NEW: Lookup Users *****
        {
          $lookup: {
            from: "user", // The collection containing user documents
            localField: "users", // The field in 'affiliations' holding user ObjectIDs
            foreignField: "_id", // The field in 'users' to match against (usually _id)
            as: "populated_users", // Store the matched user documents here
          },
        },

        // 7. Project the final desired structure, now including populated users/authors
        {
          $project: {
            _id: 1,
            name: 1,
            parent: 1,
            // "users": 1, // Original users array (optional, can remove)
            // "authors": 1, // Original authors array (optional, can remove)
            createdAt: 1,
            updatedAt: 1,

            // Replace original arrays with populated ones
            users: "$populated_users",
            authors: 1,

            // Create the descendants array using immediate children's _ids
            // "descendants": {
            //   "$map": {
            //     "input": "$immediate_children",
            //     "as": "child",
            //     "in": "$$child._id"
            //   }
            // }

            // We don't need these temporary fields in the final output
            // "immediate_children": 0,
            // "populated_users": 0, // Already assigned above
            // "populated_authors": 0 // Already assigned above
          },
        },

        // add sort by createdAt
        {
          $sort: {
            createdAt: 1,
          },
        },
      ])
      .toArray();
  }

  async checkAffiliationPermission(
    affiliationId: string | ObjectId | undefined,
    user: User | undefined
  ) {
    return;

    if (!affiliationId || !user) {
      throw new createHttpError.BadRequest("Invalid affiliation or user");
    }

    const permittedUsers =
      (await this.affiliationRepo.getAllUsersInAffiliation(
        affiliationId.toString()
      )) || [];

    if (!permittedUsers.includes(user.id)) {
      throw new createHttpError.Forbidden(
        "You do not have permission with this affiliation"
      );
    }
  }

  async getPermittedAffiliation(affiliationId: string | ObjectId) {
    const permittedAffiliation = await this.getAffiliationWithDescendants(
      affiliationId
    );
    const permittedAuthorIds = permittedAffiliation.flatMap(
      (affiliation) => affiliation.authors
    );
    return { permittedAffiliation, permittedAuthorIds };
  }
}

export default new AffiliationService();
