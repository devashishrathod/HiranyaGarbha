const mongoose = require("mongoose");
const Banner = require("../../models/Banner");
const { pagination, validateObjectId } = require("../../utils");

exports.getAllBanners = async (query) => {
  let {
    page,
    limit,
    search,
    name,
    subCategoryId,
    isActive,
    fromDate,
    toDate,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = query;
  page = page ? Number(page) : 1;
  limit = limit ? Number(limit) : 10;
  const match = { isDeleted: false };
  if (typeof isActive !== "undefined") {
    match.isActive = isActive === "true" || isActive === true;
  }
  if (subCategoryId) {
    validateObjectId(subCategoryId, "SubCategory Id");
    match.subCategoryId = mongoose.Types.ObjectId(subCategoryId);
  }
  if (name) match.name = { $regex: new RegExp(name, "i") };
  if (search) {
    match.$or = [
      { name: { $regex: new RegExp(search, "i") } },
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
  pipeline.push({
    $lookup: {
      from: "subcategories",
      localField: "subCategoryId",
      foreignField: "_id",
      as: "subCategory",
    },
  });
  pipeline.push({
    $unwind: {
      path: "$subCategory",
      preserveNullAndEmptyArrays: true,
    },
  });
  pipeline.push({
    $lookup: {
      from: "categories",
      localField: "subCategory.categoryId",
      foreignField: "_id",
      as: "category",
    },
  });
  pipeline.push({
    $unwind: {
      path: "$category",
      preserveNullAndEmptyArrays: true,
    },
  });
  pipeline.push({
    $project: {
      name: 1,
      description: 1,
      image: 1,
      video: 1,
      isActive: 1,
      createdAt: 1,
      subCategory: {
        _id: 1,
        name: 1,
        description: 1,
        categoryId: 1,
        isActive: 1,
        createdAt: 1,
      },
      category: {
        _id: 1,
        name: 1,
        description: 1,
        isActive: 1,
        createdAt: 1,
      },
    },
  });
  const sortStage = {};
  sortStage[sortBy] = sortOrder === "asc" ? 1 : -1;
  pipeline.push({ $sort: sortStage });
  return await pagination(Banner, pipeline, page, limit);
};
