const {
  asyncWrapper,
  sendSuccess,
  throwError,
  cleanJoiError,
} = require("../../utils");
const { updateSubscription } = require("../../services/subscriptions");
const { validateUpdateSubscription } = require("../../validator/subscriptions");

exports.update = asyncWrapper(async (req, res) => {
  const { error, value } = validateUpdateSubscription(req.body);
  if (error) throwError(422, cleanJoiError(error));
  const updated = await updateSubscription(req.params?.id, value);
  return sendSuccess(res, 200, "Subscription updated", updated);
});
