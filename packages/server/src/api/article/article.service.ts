import { ObjectId } from "mongodb";
import { connectDB } from "@/configs/mongodb";
import { transformObjectId } from "@/helper/transform-objectId.helper";
import { authorModel } from "../author/author.model";
import affiliationService from "../affiliation/affiliation.service";
import { articleModel } from "./article-model";

class ArticleService {
  async getPermittedArticleIds(affiliationId: ObjectId): Promise<ObjectId[]> {
    const permittedAffiliation =
      await affiliationService.getAffiliationWithDescendants(affiliationId);
    const permittedAuthorIds = permittedAffiliation.flatMap(
      (affiliation) => affiliation.authors
    );
    const authors = await authorModel
      .find({ _id: { $in: permittedAuthorIds } })
      .toArray();
    const articleSet: Set<string> = new Set();
    authors.forEach((author) => {
      author.articles &&
        author.articles.forEach((articleId) => {
          articleSet.add(articleId.toString());
        });
    });

    return Array.from(articleSet).map((articleId) =>
      transformObjectId(articleId)
    );
  }

  async findById(id: string | ObjectId) {
    return await articleModel.findOne({
      _id: typeof id === "string" ? transformObjectId(id) : id,
    });
  }

  async findByIds(ids: (string | ObjectId)[]) {
    const objectIds = ids.map((id) =>
      typeof id === "string" ? transformObjectId(id) : id
    );
    return await articleModel.find({ _id: { $in: objectIds } }).toArray();
  }
}

const articleService = new ArticleService();
export default articleService;
