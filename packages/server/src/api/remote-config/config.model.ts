import { z } from "zod";
import { connectDB } from "@/configs/mongodb";
import { WithId } from "mongodb";

const CONFIG_COLLECTION = "config";
const db = await connectDB();
const collectionExists = await db
  .listCollections({ name: CONFIG_COLLECTION })
  .hasNext();
if (!collectionExists) {
  await db.createCollection(CONFIG_COLLECTION);
}

export const configModel = db.collection(CONFIG_COLLECTION);

const systemConfig = await configModel.findOne({ key: "system" });
if (!systemConfig) {
  await configModel.insertOne({
    key: "system",
    value: {
      string_matching_threshold: 0.95,
      string_not_matching_threshold: 0.5,
    },
  });
}
