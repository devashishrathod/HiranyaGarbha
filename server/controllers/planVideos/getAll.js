const {
  asyncWrapper,
  sendSuccess,
  throwError,
  cleanJoiError,
} = require("../../utils");
const { getAllPlanVideos } = require("../../services/planVideos");
const { validateGetAllPlanVideosQuery } = require("../../validator/planVideos");

exports.getAll = asyncWrapper(async (req, res) => {
  const { error, value } = validateGetAllPlanVideosQuery(req.query);
  if (error) throwError(422, cleanJoiError(error));
  const result = await getAllPlanVideos(value);
  return sendSuccess(res, 200, "Plan videos fetched successfully", result);
});
