const {
  asyncWrapper,
  sendSuccess,
  throwError,
  cleanJoiError,
} = require("../../utils");
const { verifyPayment } = require("../../services/patientSubscriptions");
const { validateVerifyPayment } = require("../../validator/patientSubscriptions");

exports.verify = asyncWrapper(async (req, res) => {
  const { error } = validateVerifyPayment(req.body);
  if (error) throwError(422, cleanJoiError(error));

  const { subscription, alreadyActive } = await verifyPayment({
    patientId: req.patientId,
    ...req.body,
  });

  return sendSuccess(
    res,
    200,
    alreadyActive ? "Subscription already active" : "Payment verified",
    subscription
  );
});
