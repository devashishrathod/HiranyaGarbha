const {
  asyncWrapper,
  sendSuccess,
  throwError,
  cleanJoiError,
} = require("../../utils");
const { previewCheckout } = require("../../services/patientSubscriptions");
const { validatePreviewCheckout } = require("../../validator/patientSubscriptions");

exports.preview = asyncWrapper(async (req, res) => {
  const { error } = validatePreviewCheckout(req.body);
  if (error) throwError(422, cleanJoiError(error));

  const result = await previewCheckout({
    patientId: req.patientId,
    ...req.body,
  });
  return sendSuccess(res, 200, "Checkout preview", result);
});
