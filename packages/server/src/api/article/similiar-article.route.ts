import { similarArticleContract } from "@kltn/contract";
import { initServer } from "@ts-rest/express";
import { similarArticleModel } from "./similar-articles.model";
import { SimilarityStatus } from "@kltn/contract/api/similiar-article";
import { transformObjectId } from "@/helper/transform-objectId.helper";
import { articleModel } from "./article-model";
import { authorModel } from "../author/author.model";

const s = initServer();

const router = s.router(similarArticleContract, {
  getSimilarArticles: async () => {
    const similarArticles = await similarArticleModel.find().toArray();
    return {
      status: 200,
      body: similarArticles,
    };
  },

  checkSimilarity: async ({ params, body }) => {
    const { id } = params;
    const { status } = body;
    const _id = transformObjectId(id);
    const similarArticle = await similarArticleModel.findOne({ _id });

    if (status == SimilarityStatus.DUPLICATE) {
      // If the status is duplicate, delete the similar article
      await articleModel.deleteOne({ _id: similarArticle.articleId });
      await similarArticleModel.deleteOne({ _id });

      // delete article from author
      await authorModel.updateMany(
        { articles: similarArticle.articleId },
        { $pull: { articles: similarArticle.articleId } }
      );

      return {
        status: 201,
        body: { message: "Similar article deleted" },
      };
    }

    if (status == SimilarityStatus.NOT_DUPLICATE) {
      // If the status is not duplicate, delete the similar article
      await similarArticleModel.deleteOne({ _id });

      return {
        status: 201,
        body: { message: "Similar article marked as not duplicate" },
      };
    }
  },
});

export default router;
