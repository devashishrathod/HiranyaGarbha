const PatientSubscription = require("../../models/PatientSubscription");
const SubscriptionPayment = require("../../models/SubscriptionPayment");
const {
  SUBSCRIPTION_STATUS,
  SUBSCRIPTION_PAYMENT_STATUS,
  PAYMENT_ATTEMPT_STATUS,
} = require("../../constants");
const { toRupees } = require("../../helpers/patientSubscriptions");
const { activateSubscription } = require("./activateSubscription");

/**
 * Razorpay events, applied to our records.
 *
 * ⚠️ This is the source of truth for whether a plan is paid for. The browser
 * callback in `verifyPayment` is a convenience for the UI; a patient who
 * closes the tab after paying must still get their plan, and only this path
 * guarantees that.
 *
 * ⚠️ Never throws for an event it cannot use. The caller answers 200 to
 * anything already handled or uninteresting, because a non-200 makes Razorpay
 * retry the delivery for 24 hours.
 *
 * See docs/SUBSCRIPTIONS.md §6 step 2.
 */

const recordAttempt = async (payload, status, extra = {}) => {
  try {
    await SubscriptionPayment.updateOne(
      { orderId: payload.order_id, paymentId: { $exists: false } },
      {
        $set: {
          paymentId: payload.id,
          status,
          method: payload.method,
          amount: toRupees(payload.amount),
          rawEvent: payload,
          receivedAt: new Date(),
          ...extra,
        },
      }
    );

    /*
     * The CREATED row may already carry a paymentId from an earlier delivery,
     * in which case the update above matched nothing. Insert instead — and let
     * the sparse unique index on paymentId reject the duplicate.
     */
    const exists = await SubscriptionPayment.findOne({ paymentId: payload.id })
      .select("_id")
      .lean();
    if (exists) return { duplicate: false, paymentRow: exists };

    const subscription = await PatientSubscription.findOne({
      "gateway.orderId": payload.order_id,
    })
      .select("_id patientId")
      .lean();
    if (!subscription) return { duplicate: false, paymentRow: null };

    const paymentRow = await SubscriptionPayment.create({
      patientSubscriptionId: subscription._id,
      patientId: subscription.patientId,
      orderId: payload.order_id,
      paymentId: payload.id,
      amount: toRupees(payload.amount),
      status,
      method: payload.method,
      rawEvent: payload,
      receivedAt: new Date(),
      ...extra,
    });

    return { duplicate: false, paymentRow };
  } catch (error) {
    // E11000 on paymentId: Razorpay redelivered an event we already applied.
    // That is the index doing its job, not a failure.
    if (error?.code === 11000) return { duplicate: true, paymentRow: null };
    throw error;
  }
};

const onPaymentCaptured = async (payload) => {
  const { duplicate } = await recordAttempt(
    payload,
    PAYMENT_ATTEMPT_STATUS.CAPTURED
  );
  if (duplicate) return { handled: true, reason: "duplicate delivery" };

  const subscription = await PatientSubscription.findOne({
    "gateway.orderId": payload.order_id,
  });

  if (!subscription)
    return { handled: false, reason: "no subscription for this order" };

  if (subscription.status === SUBSCRIPTION_STATUS.ACTIVE)
    return { handled: true, reason: "already active" };

  /*
   * ⚠️ Cross-check what was actually captured against what we asked for.
   *
   * A mismatch means the order was tampered with or the catalogue changed
   * mid-checkout. It is left PENDING for a human rather than activated on a
   * guess — the admin listing surfaces exactly this case.
   */
  const captured = toRupees(payload.amount);
  if (Math.round(captured) !== Math.round(subscription.amountPayable)) {
    console.error(
      `[razorpay] amount mismatch on ${subscription.subscriptionNumber}: captured ${captured}, expected ${subscription.amountPayable}`
    );
    return { handled: true, reason: "amount mismatch, held for review" };
  }

  await activateSubscription({
    subscription,
    amountPaid: captured,
    gateway: { paymentId: payload.id },
  });

  return { handled: true, reason: "activated" };
};

const onPaymentFailed = async (payload) => {
  await recordAttempt(payload, PAYMENT_ATTEMPT_STATUS.FAILED, {
    failureReason: payload.error_description || payload.error_reason || "failed",
  });

  // The subscription stays PENDING_PAYMENT on purpose: the patient can retry
  // the same checkout, and the timeout sweep will close it if they never do.
  await PatientSubscription.updateOne(
    {
      "gateway.orderId": payload.order_id,
      status: SUBSCRIPTION_STATUS.PENDING_PAYMENT,
    },
    { $set: { paymentStatus: SUBSCRIPTION_PAYMENT_STATUS.FAILED } }
  );

  return { handled: true, reason: "payment failed recorded" };
};

const onRefundProcessed = async (payload) => {
  const paymentId = payload.payment_id;

  await SubscriptionPayment.updateOne(
    { paymentId },
    {
      $set: {
        status: PAYMENT_ATTEMPT_STATUS.REFUNDED,
        refund: {
          refundId: payload.id,
          amount: toRupees(payload.amount),
          reason: payload.notes?.reason,
          at: new Date(),
        },
      },
    }
  );

  await PatientSubscription.updateOne(
    { "gateway.paymentId": paymentId },
    {
      $set: {
        status: SUBSCRIPTION_STATUS.REFUNDED,
        paymentStatus: SUBSCRIPTION_PAYMENT_STATUS.REFUNDED,
        endDate: new Date(),
      },
    }
  );

  return { handled: true, reason: "refund recorded" };
};

const HANDLERS = {
  "payment.captured": (event) => onPaymentCaptured(event.payload.payment.entity),
  "payment.failed": (event) => onPaymentFailed(event.payload.payment.entity),
  "refund.processed": (event) => onRefundProcessed(event.payload.refund.entity),
};

exports.handleWebhookEvent = async (event) => {
  const handler = HANDLERS[event?.event];
  if (!handler) return { handled: false, reason: `ignored ${event?.event}` };

  return handler(event);
};
