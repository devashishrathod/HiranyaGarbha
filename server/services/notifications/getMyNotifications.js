const Notification = require("../../models/Notification");
const { pagination } = require("../../utils");

/**
 * The caller's own notification feed — what the bell icon lists.
 *
 * Scoped to `userId` from the verified token, never from the query, so one
 * person cannot read another's feed by changing an id.
 */
exports.getMyNotifications = async (userId, query = {}) => {
  const page = query.page ? Number(query.page) : 1;
  const limit = query.limit ? Number(query.limit) : 20;

  const match = { userId, isDeleted: false };

  if (typeof query.isRead !== "undefined") {
    match.isRead = query.isRead === "true" || query.isRead === true;
  }
  if (query.type) match.type = query.type;

  const pipeline = [
    { $match: match },
    { $sort: { createdAt: -1 } },
    {
      $project: {
        type: 1,
        severity: 1,
        title: 1,
        body: 1,
        imageUrl: 1,
        meta: 1,
        channels: 1,
        isRead: 1,
        readAt: 1,
        createdAt: 1,
      },
    },
  ];

  return pagination(Notification, pipeline, page, limit);
};
