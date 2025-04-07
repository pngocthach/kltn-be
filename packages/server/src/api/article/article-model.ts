import { z } from "zod";
import { connectDB } from "@/configs/mongodb";
import { ObjectId, WithId } from "mongodb";

const db = await connectDB();
const collectionExists = await db
  .listCollections({ name: "articles" })
  .hasNext();
if (!collectionExists) {
  await db.createCollection("articles");
}

export type ArticleDocument = WithId<any>;
export const articleModel = db.collection("articles");
