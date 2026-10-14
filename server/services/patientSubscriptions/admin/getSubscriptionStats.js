const PatientSubscription = require("../../../models/PatientSubscription");
const {
  SUBSCRIPTION_PAYMENT_STATUS,
  SUBSCRIPTION_STATES,
} = require("../../../constants");
const { buildBaseMatch, stateExpression } = require("./filters");

const EXPIRING_SOON_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Status-tab counts and money for the same filters as the listing.
 *
 * The state filter itself is ignored here on purpose: the tabs show how many
 * plans sit in each state *under the other filters*, so picking a tab never
 * zeroes out its siblings.
 */
exports.getSubscriptionStats = async (query = {}, now = new Date()) => {
  const soon = new Date(now.getTime() + EXPIRING_SOON_DAYS * DAY_MS);

  const [result] = await PatientSubscription.aggregate([
    { $match: await buildBaseMatch(query) },
    { $addFields: { state: stateExpression(now) } },
    {
      $facet: {
        byState: [{ $group: { _id: "$state", count: { $sum: 1 } } }],
        money: [
          {
            $group: {
              _id: null,
              // Refunded plans flip to REFUNDED, so they drop out of this.
              collected: {
                $sum: {
                  $cond: [
                    { $eq: ["$paymentStatus", SUBSCRIPTION_PAYMENT_STATUS.PAID] },
                    "$amountPaid",
                    0,
                  ],
                },
              },
              paidPlans: {
                $sum: {
                  $cond: [{ $eq: ["$paymentStatus", SUBSCRIPTION_PAYMENT_STATUS.PAID] }, 1, 0],
                },
              },
            },
          },
        ],
        expiringSoon: [
          { $match: { state: "ACTIVE", endDate: { $lte: soon } } },
          { $count: "count" },
        ],
      },
    },
  ]);

  const byState = Object.fromEntries(SUBSCRIPTION_STATES.map((state) => [state, 0]));
  (result?.byState || []).forEach(({ _id, count }) => {
    byState[_id] = (byState[_id] || 0) + count;
  });

  return {
    total: Object.values(byState).reduce((sum, count) => sum + count, 0),
    byState,
    collected: result?.money?.[0]?.collected || 0,
    paidPlans: result?.money?.[0]?.paidPlans || 0,
    expiringSoon: result?.expiringSoon?.[0]?.count || 0,
    expiringSoonDays: EXPIRING_SOON_DAYS,
  };
};
