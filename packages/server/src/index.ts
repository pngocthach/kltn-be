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
        content: `{
        "openapi": "3.0.0",
        "info": {
          "title": "Authentication API",
          "version": "1.0.0",
          "description": "A simple authentication API with email and password."
        },
        "paths": {
          "/api/auth/sign-in/email": {
            "post": {
              "summary": "Authenticate user and return a token",
              "requestBody": {
                "required": true,
                "content": {
                  "application/json": {
                    "schema": {
                      "type": "object",
                      "properties": {
                        "email": { "type": "string", "example": "test@mail.com" },
                        "password": { "type": "string", "example": "1311" }
                      },
                      "required": ["email", "password"]
                    }
                  }
                }
              },
              "responses": {
                "200": {
                  "description": "Successful authentication",
                  "content": {
                    "application/json": {
                      "schema": {
                        "type": "object",
                        "properties": {
                          "token": { "type": "string", "example": "eyJhbGciOiJI..." }
                        }
                      }
                    }
                  }
                },
                "401": {
                  "description": "Invalid credentials"
                }
              }
            }
          }
        }
      }
      `,
      },
    ],
  })
);

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
// app.use("/api", authMiddleware, authorRoute);
// app.use("/api/affiliation", authMiddleware, affiliationRoute);
app.use("/api/article", articleRoute);

createExpressEndpoints(contract.chart, chartRoute, app);
createExpressEndpoints(contract.article, articleContractRoute, app);
createExpressEndpoints(contract.author, authorRoute, app, {
  globalMiddleware: [authMiddleware],
});
createExpressEndpoints(contract.affiliation, affiliationContractRoute, app);
createExpressEndpoints(contract.jobs, jobsRoute, app);

app.get("/", (req, res) => {
  res.send("Hello World!");
});
import scopusCheckRouter from "./api/jobs/scopus-check";
app.use("/api", scopusCheckRouter);

app.all(/(.*)/, routeNotFoundMiddleware);

// Central error handling middleware
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
