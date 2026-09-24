const Notification = require("../../models/Notification");

/** Clear the badge. */
exports.markAllAsRead = async (userId) => {
  const result = await Notification.updateMany(
    { userId, isRead: false, isDeleted: false },
    { $set: { isRead: true, readAt: new Date() } }
  );

  return { updated: result?.modifiedCount || 0 };
};
