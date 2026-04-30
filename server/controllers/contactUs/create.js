const {
  asyncWrapper,
  sendSuccess,
  throwError,
  cleanJoiError,
} = require("../../utils");
const { createContactUs } = require("../../services/contactUs");
const { validateCreateContactUs } = require("../../validator/contactUs");

exports.create = asyncWrapper(async (req, res) => {
  const { error, value } = validateCreateContactUs(req.body);
  if (error) throwError(422, cleanJoiError(error));
  const result = await createContactUs(value);
  return sendSuccess(res, 201, "Contact request created", result);
});
