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
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  // In development, trust all origins
  trustedOrigins:
    process.env.NODE_ENV === "development"
      ? ["*"]
      : [
          "http://localhost",
          "http://localhost:5173",
          "http://test.localhost:5173",
          "http://admin.localhost:5173",
          "http://localhost.lol:5173",
          "http://test.localhost.lol:5173",
          "http://admin.localhost.lol:5173",
          // Add development origins
          "http://localhost:3000",
          "http://127.0.0.1:5173",
          "http://127.0.0.1:3000",
          // Docker service names
          "http://web:5173",
          "http://server1:5000",
          "http://server2:5000",
        ],
  advanced: {
    defaultCookieAttributes: {
      sameSite: process.env.NODE_ENV === "development" ? "lax" : "none",
      secure: process.env.NODE_ENV !== "development",
    },
  },
  plugins: [admin(), openAPI()],
});
