const Subscription = require("../../models/Subscription");
const { DURATION_MAP } = require("../../constants");
const { throwError, validateObjectId } = require("../../utils");

const computeDuration = (type) => {
  const days = DURATION_MAP[type];
  if (!days)
    throwError(400, "Invalid subscription type for duration calculation");
  return days;
};

exports.updateSubscription = async (id, payload) => {
  validateObjectId(id, "Subscription Id");

  const existingRecord = await Subscription.findById(id);
  if (!existingRecord || existingRecord.isDeleted)
    throwError(404, "Subscription not found");

  const nextType = payload?.type || existingRecord.type;
  const nextName = typeof payload?.name === "string" ? payload.name.trim() : null;

  if (nextName) {
    const duplicate = await Subscription.findOne({
      _id: { $ne: id },
      type: nextType,
      isDeleted: false,
      name: { $regex: new RegExp(`^${nextName}$`, "i") },
    });
    if (duplicate)
      throwError(
        409,
        `Subscription with this name for ${nextType} plan already exists`
      );
  }

  if (payload?.type) {
    payload.durationInDays = computeDuration(payload.type);
  }

  Object.assign(existingRecord, payload);
  existingRecord.updatedAt = new Date();
  await existingRecord.save();
  return existingRecord;
};
