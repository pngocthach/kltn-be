import { Request, Response } from "express";

export async function routeNotFoundMiddleware(
  req: Request,
  res: Response
): Promise<void> {
  const path = req.params[0];
  const method = req.method;
  res.status(404).json({ message: `Route ${method} ${path} not found` });
}
