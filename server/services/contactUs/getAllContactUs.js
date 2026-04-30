const ContactUs = require("../../models/ContactUs");
const { pagination } = require("../../utils");

exports.getAllContactUs = async (query) => {
  let {
    page,
    limit,
    search,
    name,
    email,
    city,
    isPermissionGiven,
    fromDate,
    toDate,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = query;

  page = page ? Number(page) : 1;
  limit = limit ? Number(limit) : 10;

  const match = { isDeleted: false };

  if (typeof isPermissionGiven !== "undefined") {
    match.isPermissionGiven =
      isPermissionGiven === "true" || isPermissionGiven === true;
  }

  if (name) match.name = { $regex: new RegExp(name, "i") };
  if (email) match.email = { $regex: new RegExp(email, "i") };
  if (city) match.city = { $regex: new RegExp(city, "i") };

  if (search) {
    match.$or = [
      { name: { $regex: new RegExp(search, "i") } },
      { email: { $regex: new RegExp(search, "i") } },
      { city: { $regex: new RegExp(search, "i") } },
      { message: { $regex: new RegExp(search, "i") } },
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
  const sortStage = {};
  sortStage[sortBy] = sortOrder === "asc" ? 1 : -1;
  pipeline.push({ $sort: sortStage });

  return await pagination(ContactUs, pipeline, page, limit);
};
