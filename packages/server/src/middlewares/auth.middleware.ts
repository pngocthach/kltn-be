import { Request, Response, NextFunction } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../utils/auth";
import { User } from "better-auth";
import { ObjectId } from "mongodb";
import {
  AffiliationDocument,
  affiliationModel,
} from "@/api/affiliation/affiliation.model";
import { transformObjectId } from "@/helper/transform-objectId.helper";
import createHttpError from "http-errors";

export interface AuthenticatedRequest extends Request {
  user?: User;
  affiliation: AffiliationDocument;
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = session.user;

    // get affiliation
    req.affiliation = await affiliationModel.findOne({
      users: req.user.email,
    });

    if (!req.affiliation) {
      throw new createHttpError.Unauthorized();
    }

    next();
  } catch (error) {
    next(error);
    return res.status(500).json({
      message: "Error retrieving session",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
