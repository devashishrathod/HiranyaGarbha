const {
  asyncWrapper,
  sendSuccess,
  throwError,
  cleanJoiError,
  validateObjectId,
} = require("../../utils");
const {
  createCampaign,
  getAllCampaigns,
  getCampaign,
  cancelCampaign,
  getCampaignStats,
  countAudience,
} = require("../../services/notifications");
const {
  validateCreateCampaign,
  validateGetAllCampaignsQuery,
  validateAudienceTarget,
} = require("../../validator/notifications");

/**
 * How many people this audience currently reaches.
 *
 * POST rather than GET because a CSV audience carries a list of addresses —
 * that does not belong in a query string or in an access log.
 */
exports.audienceCount = asyncWrapper(async (req, res) => {
  const { error, value } = validateAudienceTarget(req.body);
  if (error) throwError(422, cleanJoiError(error));

  const result = await countAudience(value);
  return sendSuccess(res, 200, "Audience resolved", result);
});

/**
 * Create and start (or schedule) a broadcast.
 *
 * ⚠️ Answers **202**, not 201: for a send-now campaign the row exists but the
 * delivery is still running in the background. A 201 would tell the panel the
 * work is finished when it has barely started.
 */
exports.create = asyncWrapper(async (req, res) => {
  const { error, value } = validateCreateCampaign(req.body);
  if (error) throwError(422, cleanJoiError(error));

  const result = await createCampaign(value, req.userId);

  return sendSuccess(
    res,
    202,
    value.scheduledAt
      ? "Notification scheduled"
      : "Notification queued for delivery",
    result
  );
});

exports.getAll = asyncWrapper(async (req, res) => {
  const { error } = validateGetAllCampaignsQuery(req.query);
  if (error) throwError(422, cleanJoiError(error));

  const result = await getAllCampaigns(req.query);
  return sendSuccess(res, 200, "Notification campaigns fetched", result);
});

exports.stats = asyncWrapper(async (req, res) => {
  const result = await getCampaignStats();
  return sendSuccess(res, 200, "Notification stats fetched", result);
});

exports.get = asyncWrapper(async (req, res) => {
  validateObjectId(req.params.id);
  const result = await getCampaign(req.params.id);
  return sendSuccess(res, 200, "Notification campaign fetched", result);
});

exports.cancel = asyncWrapper(async (req, res) => {
  validateObjectId(req.params.id);
  const result = await cancelCampaign(req.params.id);
  return sendSuccess(res, 200, "Scheduled notification cancelled", result);
});
