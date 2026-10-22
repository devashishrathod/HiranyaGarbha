const PlanVideo = require("../../models/PlanVideo");
const Subscription = require("../../models/Subscription");
const SubCategory = require("../../models/SubCategory");
const { CORE_SUBSCRIPTION_TIERS } = require("../../constants");
const { throwError } = require("../../utils");

// Category names are stored lowercased; the admin gallery page finds this
// category by the same name.
const GALLERY_CATEGORY_NAME = "gallery";

exports.assertUniqueName = async (name, exceptId) => {
  const filter = { name, isDeleted: false };
  if (exceptId) filter._id = { $ne: exceptId };
  // Case-insensitive, so "Yoga" and "yoga" cannot both exist.
  const existing = await PlanVideo.findOne(filter)
    .collation({ locale: "en", strength: 2 })
    .select("_id")
    .lean();
  if (existing) throwError(400, "A plan video with this name already exists");
};

// Main packages only — bonus courses are not offered for videos. An inactive
// package passes, so a video already on it can still be saved.
exports.assertPlans = async (packageIds) => {
  const found = await Subscription.countDocuments({
    _id: { $in: packageIds },
    isDeleted: false,
    tier: { $in: CORE_SUBSCRIPTION_TIERS },
  });
  if (found !== packageIds.length) {
    throwError(422, "One or more selected plans are not available");
  }
};

exports.assertGallerySubCategory = async (subCategoryId) => {
  const subCategory = await SubCategory.findOne({
    _id: subCategoryId,
    isDeleted: false,
  })
    .populate({ path: "categoryId", select: "name isDeleted" })
    .lean();
  if (!subCategory) throwError(422, "The selected subcategory no longer exists");

  const category = subCategory.categoryId;
  if (!category || category.isDeleted || category.name !== GALLERY_CATEGORY_NAME) {
    throwError(422, "Pick a subcategory of the Gallery category");
  }
};
