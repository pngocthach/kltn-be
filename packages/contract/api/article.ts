import { initContract } from "@ts-rest/core";
import { z } from "zod";
import { AffiliationResponseDto } from "./affiliation";
// import { ObjectId, WithId } from "mongodb";

export const AuthorSchema = z.object({
  _id: z.any(),
  name: z.string(),
  url: z.string().url(), // Ensures it's a valid URL
  createdAt: z.string().datetime(), // Ensures proper datetime format
  updatedAt: z.string().datetime(),
  articles: z.array(z.string()), // Array of article IDs (strings)
  affiliation: z.array(z.string()), // Array of affiliations (strings)
});
export type Author = z.infer<typeof AuthorSchema>;

export const jobSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("crawl_scholar"),
    url: z.string().url(),
    authorId: z.any(),
    status: z
      .enum(["pending", "processing", "completed", "failed"])
      .default("pending"),
    createdAt: z.date().default(() => new Date()),
    updatedAt: z.date().default(() => new Date()),
    completedAt: z.date().optional(),
    error: z.string().optional(),
  }),
  z.object({
    type: z.literal("crawl_scopus"),
    status: z
      .enum(["pending", "processing", "completed", "failed"])
      .default("pending"),
    createdAt: z.date().default(() => new Date()),
    completedAt: z.date().optional(),
    error: z.string().optional(),
  }),
]);
export type Job = z.infer<typeof jobSchema>;

export const ArticleResponseDto = z.object({
  _id: z.any(),
  title: z.string(),
  link: z.string(),
  metadata: z.record(z.any()),
});

const c = initContract();
export const articleContract = c.router(
  {
    getArticles: {
      method: "GET",
      path: "articles",
      responses: {
        200: c.type<z.infer<typeof ArticleResponseDto>[]>(),
      },
    },

    crawl: {
      method: "POST",
      path: "crawl",
      body: z.object({
        url: z.string().url(),
        authorId: z.string().nonempty(),
      }),
      responses: {
        201: c.type<Job>(),
      },
    },

    getArticle: {
      method: "GET",
      path: "articles/:id",
      responses: {
        200: ArticleResponseDto,
      },
    },
  },
  {
    pathPrefix: "/api/",
  }
);
