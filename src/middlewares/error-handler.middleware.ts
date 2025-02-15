import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";

export default function errorHandler(
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error(error);

  if (res.headersSent) {
    next(error);
    return;
  }

  let statusCode = 500;
  let message = "Internal server error";
  if (error instanceof createHttpError.HttpError) {
    statusCode = error.statusCode;
    message = error.message;
  }

  res.status(statusCode).json({ message });
}
