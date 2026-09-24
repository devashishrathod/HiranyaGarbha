const {
  asyncWrapper,
  sendSuccess,
  throwError,
  cleanJoiError,
} = require("../../utils");
const {
  getMySubscriptions,
  getMyHistory,
  getEntitlement,
} = require("../../services/patientSubscriptions");
const { validateHistoryQuery } = require("../../validator/patientSubscriptions");

exports.mine = asyncWrapper(async (req, res) => {
  const result = await getMySubscriptions(req.patientId);
  return sendSuccess(res, 200, "Subscriptions fetched", result);
});

exports.history = asyncWrapper(async (req, res) => {
  const { error } = validateHistoryQuery(req.query);
  if (error) throwError(422, cleanJoiError(error));

  const result = await getMyHistory(req.patientId, req.query);
  return sendSuccess(res, 200, "Subscription history fetched", result);
});

exports.entitlement = asyncWrapper(async (req, res) => {
  const result = await getEntitlement(req.patientId);
  return sendSuccess(res, 200, "Entitlement fetched", result);
});
