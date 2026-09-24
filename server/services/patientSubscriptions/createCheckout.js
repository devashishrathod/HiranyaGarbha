const PatientSubscription = require("../../models/PatientSubscription");
const SubscriptionPayment = require("../../models/SubscriptionPayment");
const {
  SUBSCRIPTION_STATUS,
  SUBSCRIPTION_PAYMENT_STATUS,
  SUBSCRIPTION_SOURCE,
  SUBSCRIPTION_KIND,
  PAYMENT_ATTEMPT_STATUS,
  PAYMENT_PURPOSE,
} = require("../../constants");
const { throwError } = require("../../utils");
const { nextSubscriptionNumber } = require("../../helpers/patientSubscriptions");
const { razorpay } = require("../../helpers/payments");
const { resolvePurchase } = require("./resolvePurchase");
const { activateSubscription } = require("./activateSubscription");

const purposeFor = ({ kind, current }) => {
  if (kind === SUBSCRIPTION_KIND.BONUS) return PAYMENT_PURPOSE.BONUS;
  return current ? PAYMENT_PURPOSE.UPGRADE : PAYMENT_PURPOSE.NEW;
};

/**
 * Price a purchase, open a Razorpay order, and park the subscription as
 * `PENDING_PAYMENT` until the webhook confirms the money.
 *
 * ⚠️ Nothing here trusts the request for an amount. `resolvePurchase` derives
 * the price from the catalogue and the patient's running plan; the body only
 * ever names *which* package and trimester.
 *
 * See docs/SUBSCRIPTIONS.md §6 step 1.
 */
exports.createCheckout = async ({
  patientId,
  packageId,
  trimester,
  source = SUBSCRIPTION_SOURCE.PATIENT,
  createdBy = null,
}) => {
  const { patient, pkg, kind, current, pricing, snapshot } =
    await resolvePurchase({ patientId, packageId, trimester });

  const base = {
    subscriptionNumber: await nextSubscriptionNumber(PatientSubscription),
    patientId,
    userId: patient.userId,
    packageId,
    kind,
    tier: pkg.tier,
    trimester,
    snapshot,
    listPrice: pricing.listPrice,
    discount: pricing.discount,
    amountPayable: pricing.amountPayable,
    currency: pricing.currency,
    proration: {
      creditFrom: pricing.creditFrom,
      creditAmount: pricing.creditApplied,
      daysRemaining: pricing.daysRemaining,
    },
    previousSubscriptionId: current?._id,
    source,
    createdBy,
  };

  /*
   * Free Basic, or a proration credit that swallows the whole price. There is
   * nothing to collect, so Razorpay is never called and the plan goes live at
   * once — the client checks for this instead of always opening checkout.
   */
  if (pricing.amountPayable === 0) {
    const created = await PatientSubscription.create({
      ...base,
      status: SUBSCRIPTION_STATUS.PENDING_PAYMENT,
      paymentStatus: SUBSCRIPTION_PAYMENT_STATUS.NOT_REQUIRED,
    });

    const activated = await activateSubscription({
      subscription: created,
      amountPaid: 0,
    });

    return { subscription: activated, free: true, razorpay: null };
  }

  /*
   * Checked before the reuse branch below, not after: an order opened while
   * keys were present is unfinishable once they are gone, and handing the
   * client an empty `keyId` would fail at the checkout popup instead of here.
   */
  if (!razorpay.isConfigured())
    throwError(
      503,
      "Online payment is not configured yet. Please try again later."
    );

  /*
   * An abandoned checkout for the very same plan is reused rather than
   * duplicated. Without this a patient who double-clicks Buy, or comes back an
   * hour later, collects a second open order for the same thing.
   *
   * The amount has to match too: a stale order priced before an upgrade credit
   * appeared would charge the wrong number.
   */
  const open = await PatientSubscription.findOne({
    patientId,
    packageId,
    trimester,
    status: SUBSCRIPTION_STATUS.PENDING_PAYMENT,
    isDeleted: false,
  });

  if (
    open &&
    open.amountPayable === pricing.amountPayable &&
    open.gateway?.orderId
  ) {
    return {
      subscription: open,
      reused: true,
      razorpay: {
        orderId: open.gateway.orderId,
        amount: Math.round(open.amountPayable * 100),
        currency: open.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
      },
    };
  }

  const order = await razorpay.createOrder({
    amount: pricing.amountPayable,
    receipt: base.subscriptionNumber,
    notes: {
      subscriptionNumber: base.subscriptionNumber,
      patientId: String(patientId),
      packageId: String(packageId),
      trimester,
    },
  });

  const subscription = await PatientSubscription.create({
    ...base,
    status: SUBSCRIPTION_STATUS.PENDING_PAYMENT,
    paymentStatus: SUBSCRIPTION_PAYMENT_STATUS.PENDING,
    gateway: { provider: "razorpay", orderId: order.orderId },
  });

  // Written now, before the patient pays, so an order that is never completed
  // still leaves a trace to reconcile against.
  await SubscriptionPayment.create({
    patientSubscriptionId: subscription._id,
    patientId,
    orderId: order.orderId,
    amount: pricing.amountPayable,
    currency: pricing.currency,
    status: PAYMENT_ATTEMPT_STATUS.CREATED,
    purpose: purposeFor({ kind, current }),
  });

  return {
    subscription,
    razorpay: {
      orderId: order.orderId,
      amount: order.amount, // paise, as the checkout script expects
      currency: order.currency,
      // Public by design. The secret never leaves the server.
      keyId: process.env.RAZORPAY_KEY_ID,
    },
  };
};
