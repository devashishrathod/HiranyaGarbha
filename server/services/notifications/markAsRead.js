const Notification = require("../../models/Notification");
const { throwError } = require("../../utils");

/**
 * Mark one notification read.
 *
 * ⚠️ `userId` is part of the filter, not checked afterwards — otherwise the
 * endpoint would let anyone flip the read state on someone else's row by id.
 */
exports.markAsRead = async (userId, notificationId) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, userId, isDeleted: false },
    { $set: { isRead: true, readAt: new Date() } },
    { new: true }
  ).lean();

  if (!notification) throwError(404, "Notification not found");

  return notification;
};
