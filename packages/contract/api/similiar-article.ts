import { initContract } from "@ts-rest/core";
import { z } from "zod";

export const SimilarArticleSchema = z.object({
  articleId: z.any(),
  title: z.string(),
  similarTo: z.object({
    articleId: z.any(),
    title: z.string(),
    similarity: z.number(),
  }),
});
export type SimilarArticleSchema = z.infer<typeof SimilarArticleSchema>;

export const similarArticleResponseDto = SimilarArticleSchema.extend({
  _id: z.any(),
});
export type SimilarArticleResponseDto = z.infer<
  typeof similarArticleResponseDto
>;

export const SimilarityStatus = {
  DUPLICATE: "duplicate",
  NOT_DUPLICATE: "not_duplicate",
} as const;

export const CheckSimilarityDto = z.object({
  status: z.enum([SimilarityStatus.DUPLICATE, SimilarityStatus.NOT_DUPLICATE]),
});

const c = initContract();

export const similarArticleContract = c.router(
  {
    getSimilarArticles: {
      method: "GET",
      path: "similar-articles",
      responses: {
        200: c.type<SimilarArticleResponseDto[]>(),
      },
    },

    checkSimilarity: {
      method: "POST",
      path: "similar-articles/:id",
      body: CheckSimilarityDto,
      responses: {
        201: c.type<any>(),
      },
    },
  },
  {
    pathPrefix: "/api/",
  }
);
