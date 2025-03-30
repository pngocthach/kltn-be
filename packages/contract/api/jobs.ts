import { initContract } from "@ts-rest/core";
import { z } from "zod";
import { jobSchema } from "./article";

const c = initContract();
export const jobsContract = c.router(
  {
    getJobs: {
      method: "GET",
      path: "/jobs",
      responses: {
        200: z.array(jobSchema),
      },
    },
  },
  {
    pathPrefix: "/api",
  }
);

export type Job = z.infer<typeof jobSchema>;
