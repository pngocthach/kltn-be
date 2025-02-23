import { Request, Router } from "express";
import affiliationService from "./affiliation.service";
import validate, { validateObjectId } from "@/middlewares/validate.middleware";
import { Affiliation, affiliationSchema } from "./affiliation.model";
import { AddUsersToAffiliationDto } from "./dto/add-users-to-aff.dto";
import checkAffiliationPermission from "./middlewares/check-aff-permission.middleware";
import { AuthenticatedRequest } from "@/middlewares/auth.middleware";
import { User } from "better-auth/types";

const router = Router();

router.get("/", async (req, res) => {
  const affiliations = await affiliationService.getAll();
  res.json(affiliations);
});

router.get("/:id", async (req, res) => {
  const affiliation = await affiliationService.getById(req.params.id);
  res.json(affiliation);
});

router.post(
  "/",
  validate(affiliationSchema),
  async (req: AuthenticatedRequest, res, next) => {
    await affiliationService.checkAffiliationPermission(
      req.body.parent,
      req.user
    );
    const affiliation = await affiliationService.create(req.body);
    res.status(201).json(affiliation);
  }
);

router.post(
  "/:id/users",
  validate(AddUsersToAffiliationDto),
  async (req, res) => {
    const affiliation = await affiliationService.addUserToAffiliation(
      req.params.id,
      req.body
    );
    res.json(affiliation);
  }
);

router.patch("/:id", async (req, res) => {
  const affiliation = await affiliationService.update(req.params.id, req.body);
  res.json(affiliation);
});

router.delete("/:id", async (req, res) => {
  const affiliation = await affiliationService.delete(req.params.id);
  res.json(affiliation);
});

export default router;
