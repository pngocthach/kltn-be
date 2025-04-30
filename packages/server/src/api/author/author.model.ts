import { z } from "zod";
import { connectDB } from "@/configs/mongodb";
import { WithId } from "mongodb";

export const authorSchema = z.object({
  name: z.string(),
  url: z.string().url(), // Ensures it's a valid URL
  createdAt: z.date(), // Ensures proper datetime format
  updatedAt: z.date(),
  articles: z.array(z.string()), // Array of article IDs (strings)
  affiliation: z.any(), // Array of affiliations (strings)
  schedule: z.number().optional(),
  scopusId: z.string().optional(), // Scopus author ID
  scholarId: z.string().optional(), // Google Scholar ID
});

// export type AuthorDocument = z.infer<typeof zAuthor>;
// const rawSchema = zodSchemaRaw(zAuthor);
// const schema = new Schema<AuthorDocument>(
//   rawSchema as unknown as AuthorDocument,
//   {
//     timestamps: true,
//   }
// );
// export const authorModel = model("Author", schema);

export type Author = z.infer<typeof authorSchema>;
export type AuthorDocument = WithId<Author>;
export const authorModel = (await connectDB()).collection<Author>("authors");
