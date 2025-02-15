import { env } from "@/utils/envConfig";
import mongoose from "mongoose";

const MONGO_URI = env.MONGO_URI;

export const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection.getClient().db(); // Already connected
  }

  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected successfully");
    return mongoose.connection.getClient().db();
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};
