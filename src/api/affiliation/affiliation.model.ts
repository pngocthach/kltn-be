import { z } from "zod";
import { connectDB } from "@/database/mongodb";
import { ObjectId, WithId } from "mongodb";

export const affiliationSchema = z.object({
  name: z.string().min(1).max(255),
  parent: z.union([z.instanceof(ObjectId), z.string()]).optional(),
  users: z.array(z.union([z.instanceof(ObjectId), z.string()])).optional(),
  authors: z.array(z.union([z.instanceof(ObjectId), z.string()])).optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

const db = await connectDB();
const collectionExists = await db
  .listCollections({ name: "affiliations" })
  .hasNext();
if (!collectionExists) {
  await db.createCollection<Affiliation>("affiliations");
}

export type Affiliation = z.infer<typeof affiliationSchema>;
export type AffiliationDocument = WithId<Affiliation>;
export const affiliationModel = db.collection<Affiliation>("affiliations");
