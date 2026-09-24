const Notification = require("../../models/Notification");
const { throwError } = require("../../utils");

/**
 * Remove one notification from the caller's feed.
 *
 * Soft delete: the row stays so a campaign's delivery history remains
 * explicable after a recipient has cleared their bell.
 */
exports.deleteMyNotification = async (userId, notificationId) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, userId, isDeleted: false },
    { $set: { isDeleted: true } },
    { new: true }
  ).lean();

  if (!notification) throwError(404, "Notification not found");

  return { deleted: true };
};
