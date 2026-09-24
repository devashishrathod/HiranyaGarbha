const PatientSubscription = require("../../models/PatientSubscription");
const { SUBSCRIPTION_STATUS } = require("../../constants");
const { throwError } = require("../../utils");
const { razorpay } = require("../../helpers/payments");
const { activateSubscription } = require("./activateSubscription");

/**
 * Verify the signature the browser received, so the success screen does not
 * have to poll.
 *
 * ⚠️ A convenience, not an authority. If the webhook has not landed yet this
 * returns `PENDING_PAYMENT` and the UI says "confirming your payment" — it
 * must never be the only path that grants a plan, or a patient who closes the
 * tab after paying would never get one.
 *
 * It *can* activate: a valid signature proves the payment belongs to our
 * order, and making the patient wait on a webhook that may be seconds behind
 * is a worse experience than granting access a moment early. The webhook is
 * still the backstop, and activation is idempotent either way.
 */
exports.verifyPayment = async ({
  patientId,
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
}) => {
  const subscription = await PatientSubscription.findOne({
    "gateway.orderId": razorpayOrderId,
    isDeleted: false,
  });

  if (!subscription) throwError(404, "No checkout found for this order");

  // Someone else's order id is not a hint worth giving away.
  if (String(subscription.patientId) !== String(patientId))
    throwError(404, "No checkout found for this order");

  if (subscription.status === SUBSCRIPTION_STATUS.ACTIVE)
    return { subscription, alreadyActive: true };

  const valid = razorpay.verifyPaymentSignature({
    orderId: razorpayOrderId,
    paymentId: razorpayPaymentId,
    signature: razorpaySignature,
  });

  if (!valid) throwError(400, "Payment could not be verified");

  const activated = await activateSubscription({
    subscription,
    amountPaid: subscription.amountPayable,
    gateway: { paymentId: razorpayPaymentId, signature: razorpaySignature },
  });

  return { subscription: activated, alreadyActive: false };
};
