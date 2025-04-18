import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { env } from "./envConfig";
import { connectDB } from "@/configs/mongodb";
import { admin, openAPI } from "better-auth/plugins";

const client = await connectDB();

export const auth = betterAuth({
  database: mongodbAdapter(client),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 1,
  },
  trustedOrigins: [
    "http://localhost:5173",
    "http://test.localhost:5173",
    "http://admin.localhost:5173",
    "http://localhost.lol:5173",
    "http://test.localhost.lol:5173",
    "http://admin.localhost.lol:5173",
  ],
  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
    },
  },
  plugins: [admin(), openAPI()],
});
