const Subscription = require("../../models/Subscription");
const { CORE_SUBSCRIPTION_TIERS } = require("../../constants");
const { throwError } = require("../../utils");
const {
  CASE_INSENSITIVE,
  normalizePlans,
  applyPlanDerivedFields,
  computeDurationFromType,
} = require("../../helpers/subscriptions");

exports.createSubscription = async (payload) => {
  const data = { ...payload };
  const plans = normalizePlans(data.plans);

  if (plans) {
    data.plans = plans;
    applyPlanDerivedFields(data, plans);
  } else {
    if (!data.type)
      throwError(400, "Either trimester plans or a subscription type is required");
    data.durationInDays = computeDurationFromType(data.type);
  }

  // Only one live Basic / Pro / Elite package may exist; bonus add-ons are many
  if (CORE_SUBSCRIPTION_TIERS.includes(data.tier)) {
    const existingTier = await Subscription.findOne({
      tier: data.tier,
      isDeleted: false,
    }).lean();
    if (existingTier)
      throwError(409, `A ${data.tier} package already exists`);
  }

  const duplicateName = await Subscription.findOne({
    name: data?.name?.trim(),
    isDeleted: false,
  })
    .collation(CASE_INSENSITIVE)
    .lean();
  if (duplicateName)
    throwError(409, "A subscription with this name already exists");

  return await Subscription.create(data);
};
