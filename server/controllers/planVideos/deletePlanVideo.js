const { asyncWrapper, sendSuccess } = require("../../utils");
const { deletePlanVideo } = require("../../services/planVideos");

exports.deletePlanVideo = asyncWrapper(async (req, res) => {
  await deletePlanVideo(req.params?.id);
  return sendSuccess(res, 200, "Plan video deleted successfully");
});
