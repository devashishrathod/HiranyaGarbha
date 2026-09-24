const { SUBSCRIPTION_STATUS } = require("../../constants");
const { daysBetween, daysRemaining } = require("./period");

/*
 * Pure arithmetic, no database and no io — so the quote the patient is shown
 * and the amount they are charged come from the same function and cannot
 * drift apart. See docs/SUBSCRIPTIONS.md §7.
 */

/**
 * What the unused part of a running plan is worth against a new one.
 *
 * ⚠️ Free plans earn nothing. Basic cost ₹0, so there is no value to carry
 * forward; without this guard a patient on free Basic would get a credit
 * computed from a price they never paid.
 */
const computeCredit = (current, now = new Date()) => {
  if (!current) return { creditAmount: 0, daysRemaining: 0 };
  if (current.status !== SUBSCRIPTION_STATUS.ACTIVE)
    return { creditAmount: 0, daysRemaining: 0 };

  const paid = Number(current.amountPaid) || 0;
  if (paid <= 0) return { creditAmount: 0, daysRemaining: 0 };

  const total = daysBetween(current.startDate, current.endDate);
  if (total <= 0) return { creditAmount: 0, daysRemaining: 0 };

  const remaining = daysRemaining(current.endDate, now);

  return {
    creditAmount: Math.max(Math.floor(paid * (remaining / total)), 0),
    daysRemaining: remaining,
  };
};

/**
 * The full quote for one purchase.
 *
 * `current` is the patient's live package, or null. Passing it in rather than
 * looking it up keeps this callable from a unit test and from the preview
 * endpoint without touching mongo.
 */
const quote = ({ plan, current = null, discount = 0, now = new Date() }) => {
  const listPrice = Number(plan?.price) || 0;
  const { creditAmount, daysRemaining: remaining } = computeCredit(current, now);

  // A credit larger than the new plan is not a refund — it just makes this
  // purchase free. Floor at zero or Razorpay gets a negative order.
  const amountPayable = Math.max(listPrice - discount - creditAmount, 0);

  return {
    listPrice,
    discount,
    creditApplied: creditAmount,
    creditFrom: creditAmount > 0 ? current?._id : undefined,
    daysRemaining: remaining,
    amountPayable,
    currency: "INR",
  };
};

/* Razorpay speaks paise. These two are the only places the unit changes. */
const toPaise = (rupees) => Math.round(Number(rupees) * 100);
const toRupees = (paise) => Number(paise) / 100;

module.exports = { computeCredit, quote, toPaise, toRupees };
