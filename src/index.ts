import express, { Request, Response } from "express";
import { env } from "./utils/envConfig";
import { connectDB } from "./database/mongodb";
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

const app = express();
const port = env.PORT;
extendZod(z);

await connectDB();

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
app.use("/api", authorRoute);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.all(/(.*)/, routeNotFoundMiddleware);

// Central error handling middleware
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
