const {
  asyncWrapper,
  sendSuccess,
  throwError,
  cleanJoiError,
} = require("../../utils");
const {
  getPlanVideoFeed,
  getPlanVideoFeedItem,
} = require("../../services/planVideos");
const { validatePlanVideoFeedQuery } = require("../../validator/planVideos");

// req.patientId is set only when a patient token came with the request.
exports.feed = asyncWrapper(async (req, res) => {
  const { error, value } = validatePlanVideoFeedQuery(req.query);
  if (error) throwError(422, cleanJoiError(error));
  const result = await getPlanVideoFeed(value, req.patientId);
  return sendSuccess(res, 200, "Videos fetched successfully", result);
});

exports.feedItem = asyncWrapper(async (req, res) => {
  const result = await getPlanVideoFeedItem(req.params?.id, req.patientId);
  return sendSuccess(res, 200, "Video fetched successfully", result);
});
