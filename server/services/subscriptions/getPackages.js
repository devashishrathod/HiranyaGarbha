const Subscription = require("../../models/Subscription");
const { SUBSCRIPTION_TIERS } = require("../../constants");
const { pickPlanForTrimester } = require("../../helpers/subscriptions");

/*
 * Feed for the packages screen: every live package with the one plan that
 * applies to the asked-for trimester already resolved, so the client just
 * renders `selectedPlan` instead of picking through the plans array.
 */
exports.getPackages = async (query = {}) => {
  const { trimester, tier, includeInactive } = query;

  const match = { isDeleted: false };
  if (!(includeInactive === "true" || includeInactive === true))
    match.isActive = true;
  if (tier) match.tier = tier;

  const records = await Subscription.find(match)
    .sort({ displayOrder: 1, price: 1 })
    .lean();

  const withPlan = records.map((record) => ({
    ...record,
    selectedPlan: pickPlanForTrimester(record.plans, trimester),
  }));

  return {
    trimester: trimester || null,
    packages: withPlan.filter((item) => item.tier !== SUBSCRIPTION_TIERS.BONUS),
    bonusCourses: withPlan.filter(
      (item) => item.tier === SUBSCRIPTION_TIERS.BONUS
    ),
  };
};
