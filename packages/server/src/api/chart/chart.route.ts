import { Router } from "express";
import { chartContract } from "@kltn/contract";
import { initServer } from "@ts-rest/express";
import { connectDB } from "@/configs/mongodb";
import { transformObjectId } from "@/helper/transform-objectId.helper";
import { ObjectId } from "mongodb";
import { AffiliationDocument } from "../affiliation/affiliation.model";
import affiliationService from "../affiliation/affiliation.service";
import articleService from "../article/article.service";

const db = await connectDB();
const articleModel = db.collection("article");
const authorModel = db.collection("authors");
const affiliationModel = db.collection("affiliations");

const s = initServer();
const router = s.router(chartContract, {
  getTotalArticles: async ({ req }) => {
    const reqAffiliation: AffiliationDocument = req["affiliation"];

    const user = req["user"];

    const articlesId = await articleService.getPermittedArticleIds(
      reqAffiliation._id
    );

    return {
      status: 200,
      body: {
        total: await articleModel.countDocuments({
          _id: { $in: articlesId },
        }),
      },
    };
  },

  getLineChartData: async ({ req }) => {
    const reqAffiliation: AffiliationDocument = req["affiliation"];
    const articlesId = await articleService.getPermittedArticleIds(
      reqAffiliation._id
    );
    const data = await articleModel
      .aggregate<{ year: number; articles: number }>([
        {
          $match: {
            _id: { $in: articlesId },
          },
        },
        {
          $match: {
            "metadata.Publication date": {
              $exists: true,
              $nin: [null, ""],
            }, // Bỏ qua null, rỗng
          },
        },
        {
          $addFields: {
            parsedDate: {
              $switch: {
                branches: [
                  {
                    case: {
                      $eq: [
                        {
                          $type: "$metadata.Publication date",
                        },
                        "date",
                      ],
                    },
                    then: "$metadata.Publication date", // Nếu đã là Date thì giữ nguyên
                  },
                  {
                    case: {
                      $eq: [
                        {
                          $type: "$metadata.Publication date",
                        },
                        "string",
                      ],
                    },
                    then: {
                      $dateFromString: {
                        dateString: "$metadata.Publication date",
                      },
                    }, // Nếu là string thì chuyển
                  },
                ],
                default: null, // Nếu không phải date hoặc string, bỏ qua
              },
            },
          },
        },
        {
          $match: { parsedDate: { $ne: null } }, // Đảm bảo không có giá trị null sau khi xử lý
        },
        {
          $addFields: {
            currentYear: { $year: "$$NOW" }, // Lấy năm hiện tại
            past10Years: {
              $subtract: [{ $year: "$$NOW" }, 9],
            }, // 9 năm trước (tổng cộng 10 năm)
          },
        },
        {
          $match: {
            $expr: {
              $and: [
                {
                  $gte: [{ $year: "$parsedDate" }, "$past10Years"],
                }, // Lớn hơn hoặc bằng năm (hiện tại - 9)
                {
                  $lte: [{ $year: "$parsedDate" }, "$currentYear"],
                }, // Nhỏ hơn hoặc bằng năm hiện tại
              ],
            },
          },
        },
        {
          $group: {
            _id: { year: { $year: "$parsedDate" } },
            articles: { $sum: 1 }, // Đếm số lượng bài báo theo năm
          },
        },
        {
          $sort: { "_id.year": 1 }, // Sắp xếp từ năm mới nhất -> cũ nhất
        },
        {
          $project: {
            _id: 0,
            year: "$_id.year",
            articles: 1,
          },
        },
      ])
      .toArray();

    return {
      status: 200,
      body: {
        data,
      },
    };
  },

  getTotalAuthors: async ({ req }) => {
    const reqAffiliation: AffiliationDocument = req["affiliation"];
    const { permittedAffiliation, permittedAuthorIds } =
      await affiliationService.getPermittedAffiliation(reqAffiliation._id);

    return {
      status: 200,
      body: {
        total: await authorModel.countDocuments({
          _id: { $in: permittedAuthorIds },
        }),
        increase: await authorModel.countDocuments({
          createdAt: { $gt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
          _id: { $in: permittedAuthorIds },
        }),
      },
    };
  },

  getTotalAffiliations: async () => {
    return {
      status: 200,
      body: {
        total: await affiliationModel.countDocuments(),
        increase: await affiliationModel
          .find({
            createdAt: { $gt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
          })
          .count(),
      },
    };
  },

  getPieChartData: async () => {
    const data = await articleModel
      .aggregate<{ type: string; count: number }>([
        {
          $facet: {
            journals: [
              {
                $match: {
                  "metadata.Journal": { $exists: true },
                },
              },
              { $count: "count" },
            ],
            books: [
              {
                $match: {
                  "metadata.Book": { $exists: true },
                },
              },
              { $count: "count" },
            ],
            conferences: [
              {
                $match: {
                  "metadata.Conference": {
                    $exists: true,
                  },
                },
              },
              { $count: "count" },
            ],
          },
        },
        {
          $project: {
            data: {
              $concatArrays: [
                [
                  {
                    type: "Journal",
                    count: {
                      $ifNull: [
                        {
                          $arrayElemAt: ["$journals.count", 0],
                        },
                        0,
                      ],
                    },
                  },
                ],
                [
                  {
                    type: "Book",
                    count: {
                      $ifNull: [
                        {
                          $arrayElemAt: ["$books.count", 0],
                        },
                        0,
                      ],
                    },
                  },
                ],
                [
                  {
                    type: "Conference",
                    count: {
                      $ifNull: [
                        {
                          $arrayElemAt: ["$conferences.count", 0],
                        },
                        0,
                      ],
                    },
                  },
                ],
              ],
            },
          },
        },
        { $unwind: "$data" },
        { $replaceRoot: { newRoot: "$data" } },
      ])
      .toArray();

    return {
      status: 200,
      body: {
        data,
      },
    };
  },
});

export default router;
