import dotenv from "dotenv";
import { cleanEnv, host, num, port, str, testOnly } from "envalid";

dotenv.config();

export const env = cleanEnv(process.env, {
  NODE_ENV: str({
    devDefault: testOnly("test"),
    choices: ["development", "production", "test"],
  }),
  HOST: host({ devDefault: testOnly("localhost") }),
  PORT: port({ devDefault: testOnly(5000) }),
  CORS_ORIGIN: str({ devDefault: testOnly("http://localhost:3000") }),
  BETTER_AUTH_SECRET: str({ devDefault: testOnly("secret") }),
  BETTER_AUTH_URL: str({ devDefault: testOnly("http://localhost:5000") }),
  MONGO_URI: str(),
  RABBITMQ_URI: str(),
  GOOGLE_CLIENT_ID: str(),
  GOOGLE_CLIENT_SECRET: str(),
});
