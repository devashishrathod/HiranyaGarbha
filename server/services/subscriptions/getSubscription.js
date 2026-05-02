const Subscription = require("../../models/Subscription");
const { throwError, validateObjectId } = require("../../utils");

exports.getSubscription = async (id) => {
  validateObjectId(id, "Subscription Id");
  const result = await Subscription.findById(id);
  if (!result || result.isDeleted) {
    throwError(404, "Subscription not found");
  }
  return result;
};
