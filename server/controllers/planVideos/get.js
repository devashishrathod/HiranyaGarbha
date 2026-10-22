const { asyncWrapper, sendSuccess } = require("../../utils");
const { getPlanVideo } = require("../../services/planVideos");

exports.get = asyncWrapper(async (req, res) => {
  const result = await getPlanVideo(req.params?.id);
  return sendSuccess(res, 200, "Plan video fetched successfully", result);
});
