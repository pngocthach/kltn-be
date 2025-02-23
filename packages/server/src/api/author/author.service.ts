import { Author, AuthorDocument } from "./author.model";
import authorMongodb from "./repository/author.mongodb";
import { AuthorRepo } from "./repository/author.repo";

class AuthorService {
  private authorRepo: AuthorRepo;

  constructor() {
    this.authorRepo = authorMongodb;
  }

  async getAuthors(): Promise<AuthorDocument[]> {
    return this.authorRepo.getAll();
  }

  async getAuthorById(id: string): Promise<AuthorDocument | undefined> {
    return this.authorRepo.getById(id);
  }

  async createAuthor(author: Author): Promise<AuthorDocument> {
    return this.authorRepo.create(author);
  }

  async updateAuthor(
    id: string,
    author: Partial<Author>
  ): Promise<AuthorDocument | undefined> {
    return this.authorRepo.update(id, author);
  }
}

export default new AuthorService();
