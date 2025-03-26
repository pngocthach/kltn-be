import { CreateAuthorDto } from "@kltn/contract/api/author";
import { Author, AuthorDocument } from "./author.model";
import authorMongodb from "./repository/author.mongodb";
import { AuthorRepo } from "./repository/author.repo";
import affiliationService from "../affiliation/affiliation.service";
import { User } from "better-auth/types";
import { affiliationModel } from "../affiliation/affiliation.model";
import { ObjectId } from "mongodb";
import createHttpError from "http-errors";

class AuthorService {
  private authorRepo: typeof authorMongodb;

  constructor() {
    this.authorRepo = authorMongodb;
  }

  async getAuthors(): Promise<AuthorDocument[]> {
    return this.authorRepo.getAll();
  }

  async getAuthorById(id: string): Promise<AuthorDocument | undefined> {
    return this.authorRepo.getById(id);
  }

  async createAuthor(
    user: User,
    dto: CreateAuthorDto
  ): Promise<AuthorDocument> {
    await affiliationService.checkAffiliationPermission(dto.affiliation, user);
    const affiliation = await affiliationService.getById(dto.affiliation);
    if (!affiliation) {
      throw createHttpError.NotFound("Affiliation not found");
    }
    const author = await authorMongodb.create({ name: dto.name, url: dto.url });
    await affiliationModel.updateOne(
      { _id: new ObjectId(dto.affiliation) },
      { $addToSet: { authors: author._id } }
    );
    return author;
  }

  async updateAuthor(
    id: string,
    author: Partial<Author>
  ): Promise<AuthorDocument | undefined> {
    return this.authorRepo.update(id, author);
  }

  async deleteAuthor(
    user: User,
    id: string
  ): Promise<AuthorDocument | undefined> {
    await affiliationService.checkAffiliationPermission(id, user);
    await affiliationModel.updateOne(
      { authors: new ObjectId(id) },
      { $pull: { authors: new ObjectId(id) } }
    );
    return this.authorRepo.delete(id);
  }
}

export default new AuthorService();
