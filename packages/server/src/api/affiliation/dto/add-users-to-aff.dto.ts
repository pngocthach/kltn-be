import { z } from "zod";

export const AddUsersToAffiliationDto = z.object({
  users: z.array(z.string().email()),
});

export type AddUsersToAffiliationDto = z.infer<typeof AddUsersToAffiliationDto>;
