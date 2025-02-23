import { Author, AuthorDocument } from "../author.model";

export interface AuthorRepo {
  getAll(): Promise<AuthorDocument[]>;
  getById(id: string): Promise<AuthorDocument | undefined>;
  create(author: Author): Promise<AuthorDocument>;
  update(
    id: string,
    author: Partial<Author>
  ): Promise<AuthorDocument | undefined>;
  delete(id: string): Promise<AuthorDocument | undefined>;
}
