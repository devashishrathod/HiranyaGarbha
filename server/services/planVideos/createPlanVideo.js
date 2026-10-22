const PlanVideo = require("../../models/PlanVideo");
const { extractYoutubeId } = require("../../helpers/youtube");
const {
  assertUniqueName,
  assertPlans,
  assertGallerySubCategory,
} = require("./references");
const { getPlanVideo } = require("./getPlanVideo");

exports.createPlanVideo = async (payload) => {
  const {
    name,
    description,
    videoUrl,
    packageIds,
    trimesters,
    subCategoryId,
    isActive,
  } = payload;

  await Promise.all([
    assertUniqueName(name),
    assertPlans(packageIds),
    subCategoryId ? assertGallerySubCategory(subCategoryId) : null,
  ]);

  const video = await PlanVideo.create({
    name,
    description,
    videoUrl,
    youtubeId: extractYoutubeId(videoUrl),
    packageIds,
    trimesters,
    subCategoryId: subCategoryId || undefined,
    isActive,
  });

  // Returned in the same shape as the list, plan names and all.
  return getPlanVideo(video._id);
};
