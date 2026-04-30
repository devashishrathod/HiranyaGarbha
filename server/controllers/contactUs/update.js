const {
  asyncWrapper,
  sendSuccess,
  throwError,
  cleanJoiError,
} = require("../../utils");
const { updateContactUs } = require("../../services/contactUs");
const { validateUpdateContactUs } = require("../../validator/contactUs");

exports.update = asyncWrapper(async (req, res) => {
  const { error, value } = validateUpdateContactUs(req.body);
  if (error) throwError(422, cleanJoiError(error));
  const updated = await updateContactUs(req.params?.id, value);
  return sendSuccess(res, 200, "Contact request updated", updated);
});
