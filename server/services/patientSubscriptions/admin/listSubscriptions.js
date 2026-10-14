const PatientSubscription = require("../../../models/PatientSubscription");
const Patient = require("../../../models/Patient");
const { buildBaseMatch, stateExpression } = require("./filters");

const SORTABLE = ["createdAt", "startDate", "endDate", "amountPaid"];

/**
 * Every plan patients have taken, newest first, filtered and paginated.
 *
 * Unlike `utils/pagination`, an empty page is a normal answer here (200 with
 * no rows) — "no plans match this filter" is not an error.
 */
exports.listSubscriptions = async (query = {}, now = new Date()) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100);
  const sortBy = SORTABLE.includes(query.sortBy) ? query.sortBy : "createdAt";
  const sortOrder = query.sortOrder === "asc" ? 1 : -1;

  const [result] = await PatientSubscription.aggregate([
    { $match: await buildBaseMatch(query) },
    { $addFields: { state: stateExpression(now) } },
    ...(query.state ? [{ $match: { state: query.state } }] : []),
    { $sort: { [sortBy]: sortOrder, _id: -1 } },
    {
      $facet: {
        total: [{ $count: "count" }],
        rows: [
          { $skip: (page - 1) * limit },
          { $limit: limit },
          {
            $lookup: {
              from: Patient.collection.name,
              localField: "patientId",
              foreignField: "_id",
              as: "patient",
              pipeline: [
                { $project: { fullName: 1, phone: 1, email: 1, userId: 1, image: 1 } },
              ],
            },
          },
          { $unwind: { path: "$patient", preserveNullAndEmptyArrays: true } },
          {
            $project: {
              subscriptionNumber: 1,
              state: 1,
              status: 1,
              kind: 1,
              tier: 1,
              trimester: 1,
              planName: "$snapshot.name",
              durationInDays: "$snapshot.durationInDays",
              startDate: 1,
              endDate: 1,
              listPrice: 1,
              discount: 1,
              amountPayable: 1,
              amountPaid: 1,
              paymentStatus: 1,
              source: 1,
              createdAt: 1,
              cancelledAt: 1,
              patient: 1,
            },
          },
        ],
      },
    },
  ]);

  const total = result?.total?.[0]?.count || 0;

  return {
    total,
    page,
    limit,
    totalPages: Math.max(Math.ceil(total / limit), 1),
    data: result?.rows || [],
  };
};
