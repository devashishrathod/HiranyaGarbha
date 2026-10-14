const { SUBSCRIPTION_STATUS } = require("../../constants");

/**
 * The one definition of "this plan has run out", shared by the expiry sweep
 * and the admin listing so they can never disagree.
 *
 * A plan runs out once its grace window closes (`graceUntil` = `endDate` +
 * GRACE_DAYS). A row without a grace window (`graceUntil` null — what
 * `buildPeriod` gives a zero-day plan) runs out at `endDate`.
 * See docs/SUBSCRIPTIONS.md §5.
 */

/** Mongo filter: ACTIVE rows that should now be EXPIRED. */
const lapsedFilter = (now = new Date()) => ({
  status: SUBSCRIPTION_STATUS.ACTIVE,
  $or: [
    { graceUntil: { $lt: now } },
    // `null` matches both an explicit null and a missing field.
    { graceUntil: null, endDate: { $lt: now } },
  ],
});

/** The same test as an aggregation expression, for computed states. */
const lapsedExpression = (now = new Date()) => {
  const lastDay = { $ifNull: ["$graceUntil", "$endDate"] };
  return {
    $and: [
      { $eq: ["$status", SUBSCRIPTION_STATUS.ACTIVE] },
      // null sorts below every date, so without this a row with no dates at
      // all would read as lapsed here while the sweep's filter skips it.
      { $ne: [lastDay, null] },
      { $lt: [lastDay, now] },
    ],
  };
};

module.exports = { lapsedFilter, lapsedExpression };
