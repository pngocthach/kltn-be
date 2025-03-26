import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { env } from "./envConfig";
import { connectDB } from "@/configs/mongodb";
import { admin } from "better-auth/plugins";

const client = await connectDB();

export const auth = betterAuth({
  database: mongodbAdapter(client),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 1,
  },
  trustedOrigins: [env.CORS_ORIGIN],
  // @ts-ignore
  plugins: [admin()],
});
