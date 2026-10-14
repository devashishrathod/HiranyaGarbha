const {
  asyncWrapper,
  sendSuccess,
  throwError,
  cleanJoiError,
  validateObjectId,
} = require("../../utils");
const {
  listSubscriptions,
  getSubscriptionStats,
  getSubscriptionDetail,
} = require("../../services/patientSubscriptions/admin");
const { validateAdminListQuery } = require("../../validator/patientSubscriptions");

const validQuery = (query) => {
  const { error, value } = validateAdminListQuery(query);
  if (error) throwError(422, cleanJoiError(error));
  return value;
};

exports.list = asyncWrapper(async (req, res) => {
  const result = await listSubscriptions(validQuery(req.query));
  return sendSuccess(res, 200, "Patient plans fetched", result);
});

exports.stats = asyncWrapper(async (req, res) => {
  const result = await getSubscriptionStats(validQuery(req.query));
  return sendSuccess(res, 200, "Patient plan stats fetched", result);
});

exports.get = asyncWrapper(async (req, res) => {
  validateObjectId(req.params.id, "plan id");
  const result = await getSubscriptionDetail(req.params.id);
  return sendSuccess(res, 200, "Patient plan fetched", result);
});
