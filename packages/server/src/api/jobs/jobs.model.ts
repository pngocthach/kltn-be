import { z } from "zod";
import { connectDB } from "@/configs/mongodb";
import { ObjectId, WithId } from "mongodb";
import { jobSchema, Job } from "@kltn/contract/api/article";

const db = await connectDB();
const collectionExists = await db.listCollections({ name: "jobs" }).hasNext();
if (!collectionExists) {
  await db.createCollection<Job>("jobs");
}

export type JobDocument = WithId<Job>;
export const jobModel = db.collection<Job>("jobs");
