const PlanVideo = require("../../models/PlanVideo");
const { throwError, validateObjectId } = require("../../utils");

// Soft delete, like the gallery. Nothing is stored on Cloudinary to clean up.
exports.deletePlanVideo = async (id) => {
  validateObjectId(id, "YouTube video ID");
  const video = await PlanVideo.findOne({ _id: id, isDeleted: false });
  if (!video) throwError(404, "YouTube video not found");
  video.isDeleted = true;
  video.isActive = false;
  await video.save();
};
