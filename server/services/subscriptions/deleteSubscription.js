const Subscription = require("../../models/Subscription");
const { throwError, validateObjectId } = require("../../utils");

exports.deleteSubscription = async (id) => {
  validateObjectId(id, "Subscription Id");
  const result = await Subscription.findById(id);
  if (!result || result.isDeleted) throwError(404, "Subscription not found");

  result.isDeleted = true;
  result.isActive = false;
  result.updatedAt = new Date();
  await result.save();
  return;
};
