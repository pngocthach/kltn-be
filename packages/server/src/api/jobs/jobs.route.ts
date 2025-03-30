import { jobsContract } from "@kltn/contract/api/jobs";
import { initServer } from "@ts-rest/express";
import { jobModel } from "./jobs.model";

const s = initServer();
const router = s.router(jobsContract, {
  getJobs: async () => {
    try {
      const jobs = await jobModel
        .find()
        .sort({ createdAt: -1 })
        .limit(100)
        .toArray();

      return {
        status: 200,
        body: jobs,
      };
    } catch (error) {
      console.error("Error fetching jobs:", error);
      return {
        status: 500,
        body: [],
      };
    }
  },
});

export default router;
