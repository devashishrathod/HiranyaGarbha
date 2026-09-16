const Subscription = require("../../models/Subscription");
const { pagination } = require("../../utils");

exports.getAllSubscriptions = async (query) => {
  let {
    page,
    limit,
    search,
    name,
    tier,
    trimester,
    type,
    isActive,
    fromDate,
    toDate,
    sortBy = "displayOrder",
    sortOrder = "asc",
  } = query;

  page = page ? Number(page) : 1;
  limit = limit ? Number(limit) : 10;

  const match = { isDeleted: false };

  if (typeof isActive !== "undefined") {
    match.isActive = isActive === "true" || isActive === true;
  }

  if (tier) match.tier = tier;
  if (trimester) match["plans.trimester"] = trimester;
  if (type) match.type = type;
  if (name) match.name = { $regex: new RegExp(name, "i") };

  if (search) {
    match.$or = [
      { name: { $regex: new RegExp(search, "i") } },
      { subtitle: { $regex: new RegExp(search, "i") } },
      { description: { $regex: new RegExp(search, "i") } },
    ];
  }

  if (fromDate || toDate) {
    match.createdAt = {};
    if (fromDate) match.createdAt.$gte = new Date(fromDate);
    if (toDate) {
      const d = new Date(toDate);
      d.setHours(23, 59, 59, 999);
      match.createdAt.$lte = d;
    }
  }

  const pipeline = [{ $match: match }];

  const sortStage = { [sortBy]: sortOrder === "asc" ? 1 : -1 };
  // displayOrder ties (0 for legacy records) fall back to newest first
  if (sortBy === "displayOrder") sortStage.createdAt = -1;
  pipeline.push({ $sort: sortStage });

  return await pagination(Subscription, pipeline, page, limit);
};
