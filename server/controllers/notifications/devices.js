const {
  asyncWrapper,
  sendSuccess,
  throwError,
  cleanJoiError,
} = require("../../utils");
const {
  registerDevice,
  unregisterDevice,
} = require("../../services/notifications");
const {
  validateRegisterDevice,
  validateUnregisterDevice,
} = require("../../validator/notifications");
const { probeFcmAuth } = require("../../helpers/push");
const { isMailConfigured } = require("../../helpers/nodeMailer");

/** Called by the app after login and on every FCM token refresh. */
exports.register = asyncWrapper(async (req, res) => {
  const { error, value } = validateRegisterDevice(req.body);
  if (error) throwError(422, cleanJoiError(error));

  const result = await registerDevice(req.userId, value);
  return sendSuccess(res, 200, "Device registered for push", result);
});

/**
 * Called by the app on logout.
 *
 * ⚠️ There is no `POST /auth/logout` yet. Until there is, this is the only
 * thing that stops the next person on a shared device from receiving the
 * previous user's notifications — see docs/NOTIFICATIONS.md §9.2.
 */
exports.unregister = asyncWrapper(async (req, res) => {
  const { error, value } = validateUnregisterDevice(req.body || {});
  if (error) throwError(422, cleanJoiError(error));

  const result = await unregisterDevice(req.userId, value);
  return sendSuccess(res, 200, "Device unregistered", result);
});

/**
 * Prove the credentials work without sending anything to a real device.
 *
 * Otherwise "is push configured correctly" is only answerable by broadcasting
 * to real users and asking whether anybody saw it.
 */
exports.health = asyncWrapper(async (req, res) => {
  const push = await probeFcmAuth();

  return sendSuccess(res, 200, "Notification health checked", {
    push,
    email: { configured: isMailConfigured() },
  });
});
