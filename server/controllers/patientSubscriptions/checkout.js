const {
  asyncWrapper,
  sendSuccess,
  throwError,
  cleanJoiError,
} = require("../../utils");
const { createCheckout } = require("../../services/patientSubscriptions");
const { validateCreateCheckout } = require("../../validator/patientSubscriptions");

exports.checkout = asyncWrapper(async (req, res) => {
  const { error } = validateCreateCheckout(req.body);
  if (error) throwError(422, cleanJoiError(error));

  const { subscription, razorpay, free } = await createCheckout({
    patientId: req.patientId,
    createdBy: req.userId,
    ...req.body,
  });

  return sendSuccess(
    res,
    201,
    free ? "Subscription activated" : "Checkout created",
    {
      subscriptionNumber: subscription.subscriptionNumber,
      subscriptionId: subscription._id,
      status: subscription.status,
      listPrice: subscription.listPrice,
      creditApplied: subscription.proration?.creditAmount || 0,
      amountPayable: subscription.amountPayable,
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      razorpay,
    }
  );
});
