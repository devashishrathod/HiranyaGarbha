const {
  asyncWrapper,
  sendSuccess,
  throwError,
  cleanJoiError,
} = require("../../utils");
const { getAllContactUs } = require("../../services/contactUs");
const { validateGetAllContactUsQuery } = require("../../validator/contactUs");

exports.getAll = asyncWrapper(async (req, res) => {
  const { error } = validateGetAllContactUsQuery(req.query);
  if (error) throwError(422, cleanJoiError(error));
  const result = await getAllContactUs(req.query);
  return sendSuccess(res, 200, "All contact requests fetched", result);
});
