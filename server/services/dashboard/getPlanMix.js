const PatientSubscription = require("../../models/PatientSubscription");
const {
  SUBSCRIPTION_STATUS,
  SUBSCRIPTION_KIND,
  SUBSCRIPTION_TIERS,
} = require("../../constants");

/*
 * A plan the patient can use right now. CANCELLED counts: a cancelled plan
 * keeps its access until `endDate` — the same rule `getEntitlement` applies.
 */
const LIVE_STATUSES = [SUBSCRIPTION_STATUS.ACTIVE, SUBSCRIPTION_STATUS.CANCELLED];

/**
 * Who is on which plan today, and how many of them started in the window.
 *
 * The mix is a snapshot of now regardless of the range picked — "active
 * subscribers last month" has no single answer. The range only drives
 * `activatedInRange`, the change chip on the KPI card.
 *
 * ⚠️ `activatedInRange` counts live plans only. Counting every plan started
 * in the window would include ones since upgraded or expired, and the chip
 * could then read "+36 new" next to 31 active.
 */
exports.getPlanMix = async (range) => {
  const live = {
    isDeleted: false,
    status: { $in: LIVE_STATUSES },
    endDate: { $gte: range.now },
  };

  const [rows, activatedInRange] = await Promise.all([
    PatientSubscription.aggregate([
      { $match: live },
      {
        $group: {
          _id: { kind: "$kind", tier: "$tier" },
          count: { $sum: 1 },
        },
      },
    ]),
    PatientSubscription.countDocuments({
      ...live,
      kind: SUBSCRIPTION_KIND.PACKAGE,
      startDate: { $gte: range.start, $lte: range.end },
    }),
  ]);

  const tiers = {
    [SUBSCRIPTION_TIERS.BASIC]: 0,
    [SUBSCRIPTION_TIERS.PRO]: 0,
    [SUBSCRIPTION_TIERS.ELITE]: 0,
  };
  let bonus = 0;

  rows.forEach(({ _id, count }) => {
    if (_id.kind === SUBSCRIPTION_KIND.BONUS) bonus += count;
    else if (_id.tier in tiers) tiers[_id.tier] += count;
  });

  const total = Object.values(tiers).reduce((sum, count) => sum + count, 0);

  return {
    total,
    paid: total - tiers[SUBSCRIPTION_TIERS.BASIC],
    bonus,
    activatedInRange,
    tiers: Object.entries(tiers).map(([tier, count]) => ({ tier, count })),
  };
};
