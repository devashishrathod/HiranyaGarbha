const { asyncWrapper, sendSuccess, throwError, cleanJoiError } = require("../../utils");
const { getDashboardSummary } = require("../../services/dashboard");
const { validateDashboardSummaryQuery } = require("../../validator/dashboard");

exports.summary = asyncWrapper(async (req, res) => {
  const { error, value } = validateDashboardSummaryQuery(req.query);
  if (error) throwError(422, cleanJoiError(error));

  const result = await getDashboardSummary(value);
  return sendSuccess(res, 200, "Dashboard fetched", result);
});
