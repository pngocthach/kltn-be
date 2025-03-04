import { initContract } from "@ts-rest/core";
import { articleContract } from "./api/article";
import { z } from "zod";

const c = initContract();
const videoContract = c.router({
  transcribeVideo: {
    method: "POST",
    path: "/transcribe",
    responses: {
      200: c.type<{ transcript: string }>(),
    },
    body: z.object({
      videoUrl: z.string(),
    }),
    summary: "Transcribe YouTube video by videoUrl",
  },
});

export { videoContract, articleContract, c };
