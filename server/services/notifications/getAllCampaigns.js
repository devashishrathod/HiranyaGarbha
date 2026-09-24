const NotificationCampaign = require("../../models/NotificationCampaign");
const { pagination } = require("../../utils");

const escapeRegex = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Paginated broadcast history — what the panel's History tab lists. */
exports.getAllCampaigns = async (query = {}) => {
  const page = query.page ? Number(query.page) : 1;
  const limit = query.limit ? Number(query.limit) : 20;

  const match = { isDeleted: false };

  if (query.status) match.status = query.status;
  if (query.channel) match.channels = query.channel;

  if (query.search) {
    const regex = new RegExp(escapeRegex(String(query.search).trim()), "i");
    match.$or = [{ title: regex }, { body: regex }, { audienceLabel: regex }];
  }

  if (query.fromDate || query.toDate) {
    match.createdAt = {};
    if (query.fromDate) match.createdAt.$gte = new Date(query.fromDate);
    if (query.toDate) {
      const end = new Date(query.toDate);
      end.setHours(23, 59, 59, 999);
      match.createdAt.$lte = end;
    }
  }

  const pipeline = [
    { $match: match },
    { $sort: { createdAt: -1 } },
    {
      $lookup: {
        from: "users",
        localField: "createdBy",
        foreignField: "_id",
        pipeline: [{ $project: { name: 1 } }],
        as: "sentBy",
      },
    },
    {
      $addFields: {
        sentBy: { $ifNull: [{ $arrayElemAt: ["$sentBy.name", 0] }, "Admin"] },
      },
    },
  ];

  return pagination(NotificationCampaign, pipeline, page, limit);
};
