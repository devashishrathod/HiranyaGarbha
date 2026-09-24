const mongoose = require("mongoose");
const PatientSubscription = require("../../models/PatientSubscription");
const {
  SUBSCRIPTION_STATUS,
  SUBSCRIPTION_PAYMENT_STATUS,
  SUBSCRIPTION_KIND,
} = require("../../constants");
const {
  buildPeriod,
  assertTransition,
} = require("../../helpers/patientSubscriptions");
const {
  sendQuietly,
  notifySubscriptionActivated,
} = require("../../helpers/notifications");

/**
 * Turn a paid (or free) subscription live.
 *
 * The single place a subscription becomes `ACTIVE`. The webhook calls it, the
 * free-Basic grant calls it, and the admin grant will too — so the period
 * arithmetic, the supersede step and the notice cannot be forgotten by
 * whichever path comes next.
 *
 * ⚠️ Idempotent. Razorpay redelivers `payment.captured` as a matter of course,
 * so an already-active subscription is returned untouched rather than having
 * its period silently restarted.
 *
 * ⚠️ The predecessor is retired **before** the new plan is activated, which
 * looks backwards — it briefly leaves the patient with no active package. That
 * order is forced by the partial unique index on `{ patientId, kind }`: two
 * ACTIVE packages cannot coexist even for an instant. Both writes therefore
 * share a transaction, so the gap is never observable and a failure rolls the
 * old plan back to ACTIVE.
 *
 * @param {object}  params
 * @param {object}  params.subscription   the PENDING_PAYMENT document
 * @param {number}  [params.amountPaid]
 * @param {object}  [params.gateway]      { paymentId, signature }
 * @param {object}  [params.session]      an outer transaction to join
 * @param {boolean} [params.notify=true]  off for backfills of historical state
 */
exports.activateSubscription = async ({
  subscription,
  amountPaid,
  gateway = {},
  session: outerSession = null,
  notify = true,
}) => {
  if (subscription.status === SUBSCRIPTION_STATUS.ACTIVE) return subscription;

  assertTransition(subscription.status, SUBSCRIPTION_STATUS.ACTIVE);

  const period = buildPeriod(subscription.snapshot?.durationInDays);
  const paid = Number(amountPaid ?? subscription.amountPayable) || 0;

  const update = {
    status: SUBSCRIPTION_STATUS.ACTIVE,
    startDate: period.startDate,
    endDate: period.endDate,
    graceUntil: period.graceUntil,
    amountPaid: paid,
    paymentStatus:
      paid > 0
        ? SUBSCRIPTION_PAYMENT_STATUS.PAID
        : SUBSCRIPTION_PAYMENT_STATUS.NOT_REQUIRED,
  };

  if (gateway.paymentId) update["gateway.paymentId"] = gateway.paymentId;
  if (gateway.signature) update["gateway.signature"] = gateway.signature;

  const session = outerSession || (await mongoose.startSession());
  const ownsSession = !outerSession;
  let activated = null;

  try {
    if (ownsSession) session.startTransaction();

    /*
     * Retire whatever package is live, not merely the one recorded as this
     * subscription's predecessor. A checkout created while the patient had no
     * plan, and paid after they acquired one, carries no
     * `previousSubscriptionId` — and would then deadlock against the unique
     * index instead of taking over. `previousSubscriptionId` stays the credit
     * lineage; this query is the access rule.
     *
     * Bonus courses stack, so they are left alone.
     */
    if (subscription.kind === SUBSCRIPTION_KIND.PACKAGE) {
      await PatientSubscription.updateMany(
        {
          _id: { $ne: subscription._id },
          patientId: subscription.patientId,
          kind: SUBSCRIPTION_KIND.PACKAGE,
          status: SUBSCRIPTION_STATUS.ACTIVE,
        },
        { $set: { status: SUBSCRIPTION_STATUS.UPGRADED } },
        { session }
      );
    }

    activated = await PatientSubscription.findOneAndUpdate(
      { _id: subscription._id, status: subscription.status },
      { $set: update },
      { new: true, session }
    );

    if (ownsSession) await session.commitTransaction();
  } catch (error) {
    if (ownsSession) await session.abortTransaction();

    /*
     * A concurrent webhook delivery may have activated this same subscription
     * first, in which case the unique index rejects ours and the outcome we
     * wanted has already happened.
     *
     * ⚠️ Only benign when the row really is live. Swallowing every 11000 would
     * turn "could not activate" into a silent success and leave a patient who
     * paid without a plan.
     */
    if (error?.code === 11000) {
      const current = await PatientSubscription.findById(subscription._id);
      if (current?.status === SUBSCRIPTION_STATUS.ACTIVE) return current;
    }
    throw error;
  } finally {
    if (ownsSession) session.endSession();
  }

  // Matched nothing: another delivery moved it out of PENDING first.
  if (!activated) return PatientSubscription.findById(subscription._id);

  /*
   * Outside the transaction: a slow SMTP round trip must not hold a payment
   * webhook open, and a failed notice must not unwind a capture.
   *
   * ⚠️ Suppressed for backfills. Granting a plan a patient should have had all
   * along is bookkeeping, not news — announcing it would mail every existing
   * patient at once about something that did not just happen.
   */
  if (notify)
    await sendQuietly(
      () => notifySubscriptionActivated(activated),
      "subscription activated notice"
    );

  return activated;
};
