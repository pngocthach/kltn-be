import { initContract } from "@ts-rest/core";
import { z } from "zod";

const c = initContract();

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

export const chartContract = c.router(
  {
    getTotalArticles: {
      method: "GET",
      path: "total-article",
      responses: {
        200: c.type<{ total: number }>(),
      },
      summary: "Get total number of articles",
    },

    getLineChartData: {
      method: "GET",
      path: "article-line-chart",
      responses: {
        200: c.type<{ data: { year: number; articles: number }[] }>(),
      },
    },

    getTotalAuthors: {
      method: "GET",
      path: "total-authors",
      responses: {
        200: c.type<{ total: number; increase: number }>(),
      },
    },

    getTotalAffiliations: {
      method: "GET",
      path: "total-affiliations",
      responses: {
        200: c.type<{ total: number; increase: number }>(),
      },
    },

    getPieChartData: {
      method: "GET",
      path: "pie-chart",
      responses: {
        200: c.type<{ data: { type: string; count: number }[] }>(),
      },
    },
  },
  {
    pathPrefix: "/api/",
  }
);
