const Subscription = require("../../models/Subscription");
const { CORE_SUBSCRIPTION_TIERS } = require("../../constants");
const { throwError, validateObjectId } = require("../../utils");
const {
  CASE_INSENSITIVE,
  normalizePlans,
  applyPlanDerivedFields,
  computeDurationFromType,
} = require("../../helpers/subscriptions");

exports.updateSubscription = async (id, payload) => {
  validateObjectId(id, "Subscription Id");

  const existingRecord = await Subscription.findById(id);
  if (!existingRecord || existingRecord.isDeleted)
    throwError(404, "Subscription not found");

  const data = { ...payload };
  const nextTier = data?.tier || existingRecord.tier;
  const nextName = typeof data?.name === "string" ? data.name.trim() : null;

  if (nextName) {
    const duplicate = await Subscription.findOne({
      _id: { $ne: id },
      name: nextName,
      isDeleted: false,
    })
      .collation(CASE_INSENSITIVE)
      .lean();
    if (duplicate)
      throwError(409, "A subscription with this name already exists");
  }

  if (data?.tier && CORE_SUBSCRIPTION_TIERS.includes(nextTier)) {
    const duplicateTier = await Subscription.findOne({
      _id: { $ne: id },
      tier: nextTier,
      isDeleted: false,
    }).lean();
    if (duplicateTier) throwError(409, `A ${nextTier} package already exists`);
  }

  const plans = normalizePlans(data.plans);
  if (plans) {
    data.plans = plans;
    applyPlanDerivedFields(data, plans);
  } else if (data?.type) {
    data.durationInDays = computeDurationFromType(data.type);
  }

  Object.assign(existingRecord, data);
  existingRecord.updatedAt = new Date();
  await existingRecord.save();
  return existingRecord;
};
