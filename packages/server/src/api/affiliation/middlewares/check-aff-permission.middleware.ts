import { AuthenticatedRequest } from "@/middlewares/auth.middleware";
import { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import affiliationMongodb from "../repository/affiliation.mongodb";
import affiliationService from "../affiliation.service";

const checkAffiliationPermission = (affiliationIdParam: string) => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<any> => {
    const user = req.user; // Assuming user is attached to req object
    const affiliationId = affiliationIdParam;
    // Check if user has permission to create affiliation
    const permittedUsers =
      (await affiliationService.getAllUsersInAffiliation(affiliationId)) || [];

    if (permittedUsers.includes(user!.email)) {
      return next();
    } else {
      throw new createHttpError.Forbidden(
        "You do not have permission with this affiliation"
      );
    }
  };
};

export default checkAffiliationPermission;
