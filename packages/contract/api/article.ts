import { initContract } from "@ts-rest/core";

const c = initContract();
export const articleContract = c.router(
  {
    getTotalArticles: {
      method: "GET",
      path: "total-article",
      responses: {
        200: c.type<{ total: number }>(),
      },
      summary: "Get total number of articles",
    },

    getLineChartData: {
      method: "GET",
      path: "article-line-chart",
      responses: {
        200: c.type<{ data: { year: number; articles: number }[] }>(),
      },
    },

    getTotalAuthors: {
      method: "GET",
      path: "total-authors",
      responses: {
        200: c.type<{ total: number; increase: number }>(),
      },
    },

    getTotalAffiliations: {
      method: "GET",
      path: "total-affiliations",
      responses: {
        200: c.type<{ total: number; increase: number }>(),
      },
    },

    getPieChartData: {
      method: "GET",
      path: "pie-chart",
      responses: {
        200: c.type<{ data: { type: string; count: number }[] }>(),
      },
    },
  },
  {
    pathPrefix: "/api/",
  }
);
