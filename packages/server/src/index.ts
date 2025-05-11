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
  // Local development origins
  "http://localhost:5000",
  "http://localhost:5173",
  "http://test.localhost:5173",
  "http://admin.localhost:5173",
  "http://localhost.lol:5173",
  "http://test.localhost.lol:5173",
  "http://admin.localhost.lol:5173",
  // Docker environment origins
  "http://localhost",
  "http://web:5173",
  // Add any additional origins as needed
];

// Configure CORS middleware for all environments
app.use(
  cors({
    origin: function (origin, callback) {
      return callback(null, true);

      // Allow requests with no origin (like mobile apps, curl, etc.)
      if (!origin) return callback(null, true);

      // In development, allow all origins
      if (process.env.NODE_ENV === "development") {
        return callback(null, true);
      }

      // In production, check against allowed origins
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.warn(`Origin ${origin} not allowed by CORS`);
        // Still allow in development
        callback(null, true);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "x-app-source"],
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
  res.redirect("http://localhost:5173");
});
import scopusCheckRouter from "./api/jobs/scopus-check";
import similiarArticleRoute from "./api/article/similiar-article.route";
app.use("/api", scopusCheckRouter);

app.all(/(.*)/, routeNotFoundMiddleware);

// Central error handling middleware
app.use(errorHandler);

// Add health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
