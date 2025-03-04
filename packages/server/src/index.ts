import express, { Request, Response } from "express";
import { env } from "./utils/envConfig";
import { connectDB } from "./configs/mongodb";
import { auth } from "./utils/auth";
import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import {
  AuthenticatedRequest,
  authMiddleware,
} from "./middlewares/auth.middleware";
import errorHandler from "./middlewares/error-handler.middleware";
import { routeNotFoundMiddleware } from "./middlewares/route-not-found.middleware";
import { extendZod } from "@zodyac/zod-mongoose";
import { z } from "zod";
import authorRoute from "./api/author/author.route";
import affiliationRoute from "./api/affiliation/affiliation.route";
import articleRoute, { setChannel } from "./api/article/crawl";
import articleContractRoute from "./api/article";
import { articleContract, videoContract } from "@kltn/contract";
import { createExpressEndpoints, initServer } from "@ts-rest/express";
import { connectRabbitMQ } from "./configs/rabbitmq";
import { startConsumer } from "./api/article/consumer";

const app = express();
const port = env.PORT;
extendZod(z);

await connectDB();
const { connection, channel } = await connectRabbitMQ();
setChannel(channel);
await startConsumer(channel);

app.use(
  cors({
    origin: [env.CORS_ORIGIN],
    credentials: true,
  })
);

app.all(/\/api\/auth\/.*/, toNodeHandler(auth));

// Mount express json middleware after Better Auth handler
// or only apply it to routes that don't interact with Better Auth
app.use(express.json());
app.use("/api", authMiddleware, authorRoute);
app.use("/api/affiliation", authMiddleware, affiliationRoute);
app.use("/api/article", articleRoute);

createExpressEndpoints(articleContract, articleContractRoute, app);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.all(/(.*)/, routeNotFoundMiddleware);

// Central error handling middleware
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
