const NotificationCampaign = require("../../models/NotificationCampaign");
const { CAMPAIGN_STATUS } = require("../../constants");

/**
 * Totals for the panel's stat cards.
 *
 * ⚠️ Scheduled campaigns are counted but contribute nothing to the delivery
 * totals — nothing has gone out for them yet, and folding their `targeted`
 * into "recipients reached" would report a broadcast that has not happened.
 */
exports.getCampaignStats = async () => {
  const [result] = await NotificationCampaign.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: null,
        campaigns: { $sum: 1 },
        scheduled: {
          $sum: {
            $cond: [{ $eq: ["$status", CAMPAIGN_STATUS.SCHEDULED] }, 1, 0],
          },
        },
        sending: {
          $sum: {
            $cond: [{ $eq: ["$status", CAMPAIGN_STATUS.SENDING] }, 1, 0],
          },
        },
        targeted: {
          $sum: {
            $cond: [
              { $eq: ["$status", CAMPAIGN_STATUS.SCHEDULED] },
              0,
              { $ifNull: ["$stats.targeted", 0] },
            ],
          },
        },
        delivered: {
          $sum: {
            $add: [
              { $ifNull: ["$stats.push.sent", 0] },
              { $ifNull: ["$stats.email.sent", 0] },
            ],
          },
        },
        failed: {
          $sum: {
            $add: [
              { $ifNull: ["$stats.push.failed", 0] },
              { $ifNull: ["$stats.email.failed", 0] },
            ],
          },
        },
        recorded: { $sum: { $ifNull: ["$stats.created", 0] } },
      },
    },
    { $project: { _id: 0 } },
  ]);

  return (
    result || {
      campaigns: 0,
      scheduled: 0,
      sending: 0,
      targeted: 0,
      delivered: 0,
      failed: 0,
      recorded: 0,
    }
  );
};
