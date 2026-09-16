const {
  asyncWrapper,
  sendSuccess,
  throwError,
  cleanJoiError,
} = require("../../utils");
const { getPackages } = require("../../services/subscriptions");
const { validateGetPackagesQuery } = require("../../validator/subscriptions");

exports.getPackages = asyncWrapper(async (req, res) => {
  const { error } = validateGetPackagesQuery(req.query);
  if (error) throwError(422, cleanJoiError(error));
  const result = await getPackages(req.query);
  return sendSuccess(res, 200, "Packages fetched", result);
});
