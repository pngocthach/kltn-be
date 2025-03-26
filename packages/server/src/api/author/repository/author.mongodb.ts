import createHttpError from "http-errors";
import { AuthorDocument, Author, authorModel } from "../author.model";
import { AuthorRepo } from "./author.repo";
import { Types } from "mongoose";
import { CreateAuthorDto } from "@kltn/contract/api/author";

class AuthorMongoDbRepo implements AuthorRepo {
  async update(
    id: string,
    author: Partial<Author>
  ): Promise<AuthorDocument | undefined> {
    author.updatedAt = new Date();
    const result = await authorModel.findOneAndUpdate(
      { _id: new Types.ObjectId(id) },
      { $set: author },
      { returnDocument: "after" }
    );
    if (!result) {
      throw new createHttpError.NotFound();
    }
    return result;
  }

  async getById(id: string): Promise<AuthorDocument | undefined> {
    const author = await authorModel.findOne({ _id: new Types.ObjectId(id) });
    if (!author) {
      throw new createHttpError.NotFound();
    }
    return author;
  }

  delete(id: string): Promise<AuthorDocument | undefined> {
    return authorModel.findOneAndDelete({ _id: new Types.ObjectId(id) });
  }

  async getAll(): Promise<AuthorDocument[]> {
    return authorModel.find().toArray();
  }

  async create(author: CreateAuthorDto): Promise<AuthorDocument> {
    const result = await authorModel.insertOne({
      ...author,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return { ...author, _id: result.insertedId };
  }
}

export default new AuthorMongoDbRepo();
