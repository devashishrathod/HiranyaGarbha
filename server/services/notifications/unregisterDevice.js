const User = require("../../models/User");

/**
 * Drop the caller's FCM token.
 *
 * ⚠️ **The app must call this on logout.** There is no `POST /auth/logout` in
 * this codebase yet; until there is, the client's own logout flow is the only
 * thing that can de-register the device.
 *
 * Leaving a token registered after logout means the next person to sign in on
 * a shared phone receives the previous user's notifications, and the device
 * keeps getting pushes for an account nobody is signed into.
 *
 * When a real logout endpoint is added it must call **this service** rather
 * than clearing the field itself, so there stays exactly one definition of
 * what de-registering means.
 */
exports.unregisterDevice = async (userId, { fcmToken } = {}) => {
  // Scoped to the token the client names when it supplies one, so a stale
  // request cannot knock out a token registered by a newer login.
  const filter = { _id: userId };
  if (fcmToken) filter.fcmToken = String(fcmToken).trim();

  const result = await User.updateOne(filter, { $set: { fcmToken: null } });

  return { unregistered: (result?.modifiedCount || 0) > 0 };
};
