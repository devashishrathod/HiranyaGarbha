const PlanVideo = require("../../models/PlanVideo");
const { throwError, validateObjectId } = require("../../utils");
const { extractYoutubeId } = require("../../helpers/youtube");
const {
  assertUniqueName,
  assertPlans,
  assertGallerySubCategory,
} = require("./references");
const { getPlanVideo } = require("./getPlanVideo");

exports.updatePlanVideo = async (id, payload) => {
  validateObjectId(id, "Plan video ID");
  const video = await PlanVideo.findOne({ _id: id, isDeleted: false });
  if (!video) throwError(404, "Plan video not found");

  const {
    name,
    description,
    videoUrl,
    packageIds,
    trimesters,
    subCategoryId,
    isActive,
  } = payload;

  if (typeof name !== "undefined") {
    await assertUniqueName(name, video._id);
    video.name = name;
  }
  if (typeof description !== "undefined") video.description = description;
  if (typeof videoUrl !== "undefined") {
    video.videoUrl = videoUrl;
    video.youtubeId = extractYoutubeId(videoUrl);
  }
  if (typeof packageIds !== "undefined") {
    await assertPlans(packageIds);
    video.packageIds = packageIds;
  }
  if (typeof trimesters !== "undefined") video.trimesters = trimesters;
  // null or "" clears it — the subcategory is optional.
  if (typeof subCategoryId !== "undefined") {
    if (subCategoryId) await assertGallerySubCategory(subCategoryId);
    video.subCategoryId = subCategoryId || undefined;
  }
  if (typeof isActive !== "undefined") video.isActive = isActive;

  await video.save();
  return getPlanVideo(video._id);
};
