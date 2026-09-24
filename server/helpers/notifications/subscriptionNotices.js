const moment = require("moment-timezone");
const { notify } = require("./notify");
const {
  NOTIFICATION_TYPES,
  NOTIFICATION_SEVERITY,
} = require("../../constants");
const { TZ } = require("../patientSubscriptions/period");

/**
 * Subscription notices — Phase 3 of docs/NOTIFICATIONS.md §10.
 *
 * Thin wrappers over `notify()`. No delivery code of their own: push, email
 * and the in-app row are all `notify`'s business, and adding a channel later
 * (SMS, WhatsApp) changes nothing here.
 *
 * ⚠️ Call these through `sendQuietly()`. A payment that was captured must
 * never be unwound because SMTP was slow.
 */

const onDate = (value) =>
  value ? moment.tz(value, TZ).format("D MMM YYYY") : "";

const rupees = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

/**
 * Sent the moment a plan goes live — after a captured payment, or straight
 * away for a free or admin-granted plan.
 *
 * This is the one notice in the system where **email is on**. A paid purchase
 * deserves a receipt the patient can keep, so the mail carries the plan, the
 * amount and the validity window.
 */
exports.notifySubscriptionActivated = async (subscription) => {
  const planName = subscription?.snapshot?.name || "your plan";
  const till = onDate(subscription?.endDate);
  const paid = Number(subscription?.amountPaid) || 0;

  const body = paid > 0
    ? `${planName} is active. Valid till ${till}.`
    : `${planName} is now active for you. Valid till ${till}.`;

  return notify({
    userId: subscription.userId,
    type: NOTIFICATION_TYPES.SUBSCRIPTION_ACTIVATED,
    severity: NOTIFICATION_SEVERITY.SUCCESS,
    title: "Subscription activated",
    body,
    deepLink: `app://subscriptions/${subscription._id}`,
    meta: {
      subscriptionId: subscription._id,
      subscriptionNumber: subscription.subscriptionNumber,
      tier: subscription.tier,
    },
    // A receipt is worth the SMTP round trip; nothing else in this module is.
    email: true,
    mail: {
      subject: `${planName} is active — Hiranyagarbha`,
      body: [
        `Hi {{name}}, your ${planName} is now active.`,
        ``,
        `Plan       : ${planName}`,
        paid > 0 ? `Amount paid: ${rupees(paid)}` : `Amount paid: Free`,
        `Valid from : ${onDate(subscription.startDate)}`,
        `Valid till : ${till}`,
        `Reference  : ${subscription.subscriptionNumber}`,
      ].join("\n"),
      ctaLabel: "Open my plan",
      footnote: "Keep this mail for your records.",
    },
  });
};

/*
 * Phase 2 and 4 of docs/SUBSCRIPTIONS.md §10 add the rest here — renewed,
 * cancelled, expiring and expired — as siblings of the wrapper above.
 *
 * ⚠️ The two job-driven ones need a `dedupeKey`
 * (`SUBSCRIPTION_EXPIRING:<id>:7D`): without it an hourly sweep sends the same
 * reminder twenty-four times a day.
 */
