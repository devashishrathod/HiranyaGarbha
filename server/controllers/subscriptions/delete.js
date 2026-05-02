const { asyncWrapper, sendSuccess } = require("../../utils");
const { deleteSubscription } = require("../../services/subscriptions");

exports.deleteSubscription = asyncWrapper(async (req, res) => {
  await deleteSubscription(req.params?.id);
  return sendSuccess(res, 200, "Subscription deleted successfully");
});
