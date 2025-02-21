import { connectDB } from "@/database/mongodb";
import { User } from "better-auth/types";
import { WithId } from "mongodb";

const db = await connectDB();
export const userModel = db.collection<User>("user");
export type UserDocument = WithId<User>;
