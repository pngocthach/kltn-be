import express from "express";
import { env } from "./utils/envConfig";
import { connectDB } from "./configs/mongodb";
import { auth } from "./utils/auth";
import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import { authMiddleware } from "./middlewares/auth.middleware";
import errorHandler from "./middlewares/error-handler.middleware";
import { routeNotFoundMiddleware } from "./middlewares/route-not-found.middleware";
import { extendZod } from "@zodyac/zod-mongoose";
import { z } from "zod";
import authorRoute from "./api/author/author.route";
import affiliationRoute from "./api/affiliation/affiliation.route";
import articleRoute, { setChannel } from "./api/article/crawl";
import articleContractRoute from "./api/article/article.route";
import { articleContract, authorContract, chartContract } from "@kltn/contract";
import { createExpressEndpoints } from "@ts-rest/express";
import { rabbitMQ } from "./configs/rabbitmq";
import { startConsumer } from "./api/article/consumer";
import { contract } from "@kltn/contract";
import { generateOpenApi } from "@ts-rest/open-api";
import { apiReference } from "@scalar/express-api-reference";
import { writeFileSync } from "fs";
import chartRoute from "./api/chart/chart.route";
import affiliationContractRoute from "./api/affiliation/affiliation.route";
import "./api/jobs/jobs.index";
import "./api/remote-config/config.model";
import jobsRoute from "./api/jobs/jobs.route";

const app = express();
const port = env.PORT;
extendZod(z);

await connectDB();
await rabbitMQ.initialize();
await startConsumer();

const allowedOrigins = [
  "http://localhost:5000",
  "http://localhost:5173",
  "http://test.localhost:5173",
  "http://admin.localhost:5173",
  "http://localhost.lol:5173",
  "http://test.localhost.lol:5173",
  "http://admin.localhost.lol:5173",
];

// Global CORS middleware
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    // allowedHeaders: [
    //   "Content-Type",
    //   "Authorization",
    //   "X-Requested-With",
    //   "Accept",
    //   "Origin",
    // ],
    exposedHeaders: ["Set-Cookie"],
  })
);

const authOpenApiDocument = await auth.api.generateOpenAPISchema();

const openApiDocument = generateOpenApi(contract, {
  info: {
    title: "Posts API",
    version: "1.0.0",
  },
});

app.get("/open-api", (req, res) => {
  res.send(openApiDocument);
});

writeFileSync("./openapi.json", JSON.stringify(openApiDocument));

app.use(
  "/scalar",
  // @ts-ignore
  apiReference({
    sources: [
      {
        url: "/open-api",
      },
      {
        title: "Authentication", // optional, would fallback to 'API #1'
        content: authOpenApiDocument,
      },
    ],
  })
);

app.all(/\/api\/auth\/.*/, toNodeHandler(auth));

// Mount express json middleware after Better Auth handler
// or only apply it to routes that don't interact with Better Auth
app.use(express.json());
// app.use("/api", authMiddleware, authorRoute);
// app.use("/api/affiliation", authMiddleware, affiliationRoute);
// app.use("/api/article", authMiddleware, articleRoute);

createExpressEndpoints(contract.chart, chartRoute, app, {
  globalMiddleware: [authMiddleware as any],
});
createExpressEndpoints(contract.article, articleContractRoute, app, {
  globalMiddleware: [authMiddleware as any],
});
createExpressEndpoints(contract.author, authorRoute, app, {
  globalMiddleware: [authMiddleware as any],
});
createExpressEndpoints(contract.affiliation, affiliationContractRoute, app, {
  globalMiddleware: [authMiddleware as any],
});
createExpressEndpoints(contract.jobs, jobsRoute, app, {
  globalMiddleware: [authMiddleware as any],
});
createExpressEndpoints(contract.similarArticle, similiarArticleRoute, app, {
  globalMiddleware: [authMiddleware as any],
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});
import scopusCheckRouter from "./api/jobs/scopus-check";
import similiarArticleRoute from "./api/article/similiar-article.route";
app.use("/api", scopusCheckRouter);

app.all(/(.*)/, routeNotFoundMiddleware);

// Central error handling middleware
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
