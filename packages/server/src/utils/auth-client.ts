import { createAuthClient } from "better-auth/client";
import { adminClient } from "better-auth/client/plugins";
import { env } from "./envConfig";

const authClient = createAuthClient({
  baseURL: `${env.HOST}:${env.PORT}`, // the base url of your auth server
  // @ts-ignore
  plugins: [adminClient()],
});
