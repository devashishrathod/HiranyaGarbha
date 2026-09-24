const Notification = require("../../models/Notification");

/**
 * The badge number.
 *
 * Runs on every app open, which is why `{ userId, isRead, isDeleted }` is its
 * own index — this must never become a scan over one person's whole history.
 */
exports.getUnreadCount = async (userId) => {
  const count = await Notification.countDocuments({
    userId,
    isRead: false,
    isDeleted: false,
  });

  return { unread: count };
};
