const {
  asyncWrapper,
  sendSuccess,
  throwError,
  cleanJoiError,
} = require("../../utils");
const { createPlanVideo } = require("../../services/planVideos");
const { validateCreatePlanVideo } = require("../../validator/planVideos");

exports.create = asyncWrapper(async (req, res) => {
  const { error, value } = validateCreatePlanVideo(req.body);
  if (error) throwError(422, cleanJoiError(error));
  const result = await createPlanVideo(value);
  return sendSuccess(res, 201, "YouTube video created successfully", result);
});
