import { z } from "zod";
import { connectDB } from "@/database/mongodb";
import { WithId } from "mongodb";

export const authorSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email().optional(),
  url: z.string().url(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
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
