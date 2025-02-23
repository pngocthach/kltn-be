import { User } from "better-auth/types";
import { Affiliation, AffiliationDocument } from "./affiliation.model";
import affiliationMongodb from "./repository/affiliation.mongodb";
import { AffiliationRepo } from "./repository/affiliation.repo";
import { AddUsersToAffiliationDto } from "./dto/add-users-to-aff.dto";
import createHttpError from "http-errors";
import { ObjectId } from "mongodb";

class AuthorService {
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

  async create(affiliation: Affiliation): Promise<AffiliationDocument> {
    return this.affiliationRepo.create(affiliation);
  }

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
}

export default new AuthorService();
