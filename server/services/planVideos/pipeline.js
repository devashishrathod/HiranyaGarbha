const mongoose = require("mongoose");

const toId = (id) => new mongoose.Types.ObjectId(id);

// Search text is user input; unescaped, a "(" would make the query throw.
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const THUMBNAIL = {
  $concat: ["https://img.youtube.com/vi/", "$youtubeId", "/hqdefault.jpg"],
};

/**
 * Filters the admin list and the patient feed share. The category lives on
 * the subcategory, so it can only be matched once the lookups have run.
 */
const buildFilters = (query = {}) => {
  const {
    search,
    subCategoryId,
    categoryId,
    trimester,
    packageId,
    isActive,
    fromDate,
    toDate,
  } = query;

  const match = { isDeleted: false };
  if (typeof isActive === "boolean") match.isActive = isActive;
  if (subCategoryId) match.subCategoryId = toId(subCategoryId);
  if (packageId) match.packageIds = toId(packageId);
  if (trimester) match.trimesters = trimester;
  if (search) {
    const pattern = new RegExp(escapeRegex(search), "i");
    match.$or = [{ name: pattern }, { description: pattern }];
  }
  if (fromDate || toDate) {
    match.createdAt = {};
    if (fromDate) match.createdAt.$gte = new Date(fromDate);
    if (toDate) {
      const end = new Date(toDate);
      end.setHours(23, 59, 59, 999);
      match.createdAt.$lte = end;
    }
  }

  const afterLookup = categoryId ? { "category._id": toId(categoryId) } : null;
  return { match, afterLookup };
};

const lookups = (packageFields) => [
  {
    $lookup: {
      from: "subcategories",
      let: { id: "$subCategoryId" },
      pipeline: [
        { $match: { $expr: { $eq: ["$_id", "$$id"] }, isDeleted: false } },
        { $project: { name: 1, categoryId: 1 } },
      ],
      as: "subCategory",
    },
  },
  { $unwind: { path: "$subCategory", preserveNullAndEmptyArrays: true } },
  {
    $lookup: {
      from: "categories",
      let: { id: "$subCategory.categoryId" },
      pipeline: [
        { $match: { $expr: { $eq: ["$_id", "$$id"] }, isDeleted: false } },
        { $project: { name: 1 } },
      ],
      as: "category",
    },
  },
  { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
  // Read live and without deleted packages: a rename shows at once and a
  // deleted package drops off the video by itself.
  {
    $lookup: {
      from: "subscriptions",
      let: { ids: { $ifNull: ["$packageIds", []] } },
      pipeline: [
        { $match: { $expr: { $in: ["$_id", "$$ids"] }, isDeleted: false } },
        { $sort: { displayOrder: 1, price: 1 } },
        { $project: packageFields },
      ],
      as: "packages",
    },
  },
];

const SHARED_FIELDS = {
  name: 1,
  description: 1,
  videoUrl: 1,
  youtubeId: 1,
  thumbnail: THUMBNAIL,
  packages: 1,
  trimesters: 1,
  subCategory: { _id: 1, name: 1 },
  category: { _id: 1, name: 1 },
  createdAt: 1,
};

/* What each audience gets back. Patients never see admin-only state. */
const ADMIN_VIEW = Object.freeze({
  packageFields: { name: 1, tier: 1, isActive: 1 },
  fields: { ...SHARED_FIELDS, isActive: 1, updatedAt: 1 },
});
const FEED_VIEW = Object.freeze({
  packageFields: { name: 1, tier: 1 },
  fields: SHARED_FIELDS,
});

const buildPipeline = ({
  match,
  afterLookup,
  sortBy = "createdAt",
  sortOrder = "desc",
  packageFields,
  fields,
}) => [
  { $match: match },
  ...lookups(packageFields),
  ...(afterLookup ? [{ $match: afterLookup }] : []),
  // _id breaks ties so a page never repeats or skips a video.
  { $sort: { [sortBy]: sortOrder === "asc" ? 1 : -1, _id: -1 } },
  { $project: fields },
];

module.exports = { toId, buildFilters, buildPipeline, ADMIN_VIEW, FEED_VIEW };
