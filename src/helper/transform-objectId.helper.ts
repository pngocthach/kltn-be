import createHttpError from "http-errors";
import { ObjectId } from "mongodb";

export function transformObjectId(s: string | ObjectId): ObjectId {
  if (!ObjectId.isValid(s)) {
    throw createHttpError(400, "Invalid ObjectId");
  }
  return new ObjectId(s);
}
