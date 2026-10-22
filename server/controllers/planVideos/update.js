const {
  asyncWrapper,
  sendSuccess,
  throwError,
  cleanJoiError,
} = require("../../utils");
const { updatePlanVideo } = require("../../services/planVideos");
const { validateUpdatePlanVideo } = require("../../validator/planVideos");

exports.update = asyncWrapper(async (req, res) => {
  const { error, value } = validateUpdatePlanVideo(req.body);
  if (error) throwError(422, cleanJoiError(error));
  const result = await updatePlanVideo(req.params?.id, value);
  return sendSuccess(res, 200, "Plan video updated successfully", result);
});
