const {
  asyncWrapper,
  sendSuccess,
  throwError,
  cleanJoiError,
  validateObjectId,
} = require("../../utils");
const {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteMyNotification,
} = require("../../services/notifications");
const { validateMyNotificationsQuery } = require("../../validator/notifications");

/**
 * The caller's own feed.
 *
 * ⚠️ Every handler here takes `req.userId` from the verified token and never
 * an id from the request. A feed endpoint that accepted a user id in the path
 * would let any logged-in account read anyone else's notifications.
 */

exports.list = asyncWrapper(async (req, res) => {
  const { error } = validateMyNotificationsQuery(req.query);
  if (error) throwError(422, cleanJoiError(error));

  const result = await getMyNotifications(req.userId, req.query);
  return sendSuccess(res, 200, "Notifications fetched", result);
});

exports.unreadCount = asyncWrapper(async (req, res) => {
  const result = await getUnreadCount(req.userId);
  return sendSuccess(res, 200, "Unread count fetched", result);
});

exports.read = asyncWrapper(async (req, res) => {
  validateObjectId(req.params.id);
  const result = await markAsRead(req.userId, req.params.id);
  return sendSuccess(res, 200, "Notification marked as read", result);
});

exports.readAll = asyncWrapper(async (req, res) => {
  const result = await markAllAsRead(req.userId);
  return sendSuccess(res, 200, "All notifications marked as read", result);
});

exports.remove = asyncWrapper(async (req, res) => {
  validateObjectId(req.params.id);
  const result = await deleteMyNotification(req.userId, req.params.id);
  return sendSuccess(res, 200, "Notification removed", result);
});
