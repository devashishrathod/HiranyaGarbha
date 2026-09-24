const User = require("../../models/User");
const { throwError } = require("../../utils");

/**
 * Store the caller's FCM token.
 *
 * The mobile app calls this right after login, and again whenever Firebase
 * rotates the token (which it does on reinstall, on restore to a new device,
 * and occasionally on its own).
 *
 * ⚠️ **The token is cleared from every other account first.**
 *
 * A device token identifies an *install*, not a person, and installs change
 * hands — a shared phone, a reinstall, a logout-and-login as someone else.
 * Without this, the previous owner's account keeps the same token and both
 * accounts receive each other's notifications. `dispatchPush` is written to
 * survive that (it maps a token back to a list of users), but surviving it is
 * not the same as being correct.
 *
 * This is the single-token stand-in for what the `DeviceToken` collection does
 * with a unique index — see docs/NOTIFICATIONS.md §9.3.
 */
exports.registerDevice = async (userId, { fcmToken, platform } = {}) => {
  if (!fcmToken || !String(fcmToken).trim()) {
    throwError(422, "fcmToken is required");
  }

  const token = String(fcmToken).trim();

  await User.updateMany(
    { fcmToken: token, _id: { $ne: userId } },
    { $set: { fcmToken: null } }
  );

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: { fcmToken: token, lastActivity: new Date() } },
    { new: true }
  )
    .select("_id fcmToken")
    .lean();

  if (!user) throwError(404, "User not found");

  return { registered: true, platform: platform || null };
};
