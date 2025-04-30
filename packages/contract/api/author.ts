import { initContract } from "@ts-rest/core";
import { z, ZodAny } from "zod";

const c = initContract();

export const AuthorResponseSchema = z.object({
  _id: z.any(),
  name: z.string(),
  url: z.string().url(), // Ensures it's a valid URL
  createdAt: z.date(), // Ensures proper datetime format
  updatedAt: z.date(),
  schedule: z.number().optional(),
  articles: z.array(z.string()), // Array of article IDs (strings)
  affiliation: z.array(z.string()), // Array of affiliations (strings)
  scopusId: z.string().optional(), // Scopus author ID
  scholarId: z.string().optional(), // Google Scholar ID
});
export type AuthorResponse = z.infer<typeof AuthorResponseSchema>;

export const authorSchema = z.object({
  name: z.string(),
  url: z.string().url(), // Ensures it's a valid URL
  createdAt: z.date(), // Ensures proper datetime format
  updatedAt: z.date(),
  articles: z.array(z.string()), // Array of article IDs (strings)
  affiliation: z.any(),
  schedule: z.number().optional(),
  scopusId: z.string().optional(), // Scopus author ID
  scholarId: z.string().optional(), // Google Scholar ID
});
export type Author = z.infer<typeof authorSchema>;

export const AuthorResponseDto = authorSchema.extend({
  affiliation: z.array(z.string()),
});
export type AuthorResponseDto = z.infer<typeof AuthorResponseDto>;

const CreateAuthorDto = authorSchema.pick({
  name: true,
  url: true,
  affiliation: true,
});
export type CreateAuthorDto = z.infer<typeof CreateAuthorDto>;

export const UpdateAuthorDto = z.object({
  name: z.string().optional(),
  url: z.string().url().optional(),
  affiliation: z
    .string()
    .regex(/^[0-9a-f]{24}$/) // This will be the affiliation ID
    .optional(),
  schedule: z.number().optional(),
  scopusId: z.string().optional(), // Allow updating Scopus ID
  scholarId: z.string().optional(), // Allow updating Google Scholar ID
});

export type UpdateAuthorDto = z.infer<typeof UpdateAuthorDto>;

export const authorContract = c.router(
  {
    getAuthors: {
      method: "GET",
      path: "authors",
      responses: {
        200: c.type<AuthorResponseDto[]>(),
      },
    },

    createAuthor: {
      method: "POST",
      path: "authors",
      body: CreateAuthorDto,
      responses: {
        201: c.type<AuthorResponse>(),
        404: c.type<{ error: string }>(),
      },
    },

    editAuthor: {
      method: "PATCH",
      path: "authors/:id",
      body: UpdateAuthorDto,
      responses: {
        200: c.type<AuthorResponse>(),
      },
    },

    deleteAuthor: {
      method: "DELETE",
      path: "authors/:id",
      responses: {
        200: c.type<any>(),
      },
    },
  },

  {
    pathPrefix: "/api/",
  }
);
