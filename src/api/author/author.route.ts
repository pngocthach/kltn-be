import { Router } from "express";
import authorService from "./author.service";
import { z } from "zod";
import { authorSchema } from "./author.model";
import validate, { validateObjectId } from "@/middlewares/validate.middleware";

const router = Router();

router.get("/authors", async (req, res) => {
  const authors = await authorService.getAuthors();
  res.json(authors);
});

router.get("/authors/:id", validateObjectId, async (req, res) => {
  const author = await authorService.getAuthorById(req.params.id);
  res.json(author);
});

router.post("/authors", validate(authorSchema), async (req, res) => {
  // check if the request body is valid using zod
  const author = await authorService.createAuthor(req.body);
  res.json(author);
});

router.patch(
  "/authors/:id",
  validateObjectId,
  validate(authorSchema.partial()),
  async (req, res) => {
    const author = await authorService.updateAuthor(req.params.id, req.body);
    res.json(author);
  }
);

// router.delete("/authors/:id", deleteAuthor);

export default router;
