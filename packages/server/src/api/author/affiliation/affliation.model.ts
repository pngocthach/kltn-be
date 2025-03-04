import { z } from "zod";
import { connectDB } from "@/configs/mongodb";
import { WithId } from "mongodb";

export const affiliationSchema = z.object({
  name: z.string().min(1).max(255),
  parent: z.string().optional(),
  users: z.array(z.string()).optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export type Affiliation = z.infer<typeof affiliationSchema>;
export type AffiliationDocument = WithId<Affiliation>;
export const authorModel = (await connectDB()).collection<Affiliation>(
  "affiliations"
);
