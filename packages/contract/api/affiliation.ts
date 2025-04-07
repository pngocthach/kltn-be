import { z } from "zod";
import { initContract } from "@ts-rest/core";

const c = initContract();

export const CreateAffiliationDto = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  parent: z.string().optional(),
  admin: z
    .object({
      email: z.string().email("Please enter a valid email address"),
      name: z.string().optional(),
      password: z.string().optional(),
    })
    .optional()
    .refine(
      (data) => {
        // If any admin field is provided, email must be present
        if (data?.name || data?.password) {
          return !!data.email;
        }
        return true;
      },
      {
        message: "Admin email is required when providing admin details",
        path: ["email"],
      }
    ),
});

export const AffiliationResponseDto = z.object({
  _id: z.any(),
  name: z.string(),
  parent: z.string().optional(),
  authors: z.array(z.any()),
  users: z
    .array(
      z.object({
        _id: z.string(),
        name: z.string(),
        email: z.string(),
        emailVerified: z.boolean(),
        createdAt: z.string(),
        updatedAt: z.string(),
      })
    )
    .optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const CreateUserDto = z.object({
  name: z.string().min(2, "Name must be at least 2 characters.").optional(),
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export const UpdateAffiliationDto = z.object({
  name: z.string().min(2, "Name must be at least 2 characters.").optional(),
  parent: z.string().optional(),
  admins: z.array(CreateUserDto).optional(),
});

export const affiliationContract = c.router(
  {
    createAffiliation: {
      method: "POST",
      path: "affiliation",
      body: CreateAffiliationDto,
      responses: {
        201: z.any(),
      },
    },
    getAffiliation: {
      method: "GET",
      path: "affiliation/:id",
      responses: {
        200: AffiliationResponseDto,
      },
    },

    getRawAffiliations: {
      method: "GET",
      path: "raw-affiliations",
      responses: {
        200: AffiliationResponseDto.extend({
          parent: z.any().optional(),
        }).array(),
      },
    },

    getAffiliations: {
      method: "GET",
      path: "affiliations",
      responses: {
        200: AffiliationResponseDto.array(),
      },
    },

    editAffiliation: {
      method: "PATCH",
      path: "affiliation/:id",
      body: UpdateAffiliationDto,
      responses: {
        200: z.any(),
      },
    },
    deleteAffiliation: {
      method: "DELETE",
      path: "affiliation/:id",
      responses: {
        200: z.object({
          message: z.string(),
        }),
      },
    },
  },
  {
    pathPrefix: "/api/",
  }
);

export type CreateAffiliationDto = z.infer<typeof CreateAffiliationDto>;
export type AffiliationResponse = z.infer<typeof AffiliationResponseDto>;
