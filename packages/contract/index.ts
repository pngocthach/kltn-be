import { initContract } from "@ts-rest/core";
import { articleContract } from "./api/article";
import { chartContract } from "./api/chart";
import { authorContract } from "./api/author";
import { affiliationContract } from "./api/affiliation";

const c = initContract();
const contract = c.router({
  chart: chartContract,
  article: articleContract,
  author: authorContract,
  affiliation: affiliationContract,
});

export {
  contract,
  articleContract,
  chartContract,
  authorContract,
  affiliationContract,
};
