import { connectDB } from "@/configs/mongodb";
import { ObjectId, WithId } from "mongodb";
import { SimilarArticleSchema } from "@kltn/contract/api/similiar-article";

const SIMILAR_ARTICLE_COLLECTION = "similar_articles";
const db = await connectDB();
const collectionExists = await db
  .listCollections({ name: SIMILAR_ARTICLE_COLLECTION })
  .hasNext();
if (!collectionExists) {
  await db.createCollection<SimilarArticleSchema>(SIMILAR_ARTICLE_COLLECTION);
}

export type DuplicateArticleDocument = WithId<SimilarArticleSchema>;
export const similarArticleModel = db.collection<SimilarArticleSchema>(
  SIMILAR_ARTICLE_COLLECTION
);
