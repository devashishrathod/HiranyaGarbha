const Notification = require("../../models/Notification");
const NotificationCampaign = require("../../models/NotificationCampaign");
const { CAMPAIGN_STATUS } = require("../../constants");

/**
 * The most recent broadcast that actually went out, with its reach.
 *
 * Scheduled and cancelled campaigns are skipped — nothing was delivered for
 * them yet, so there is no reach to show.
 *
 * `read` comes from the in-app rows the campaign wrote: `isRead` is the only
 * engagement signal there is, since push and email opens are not tracked.
 */
exports.getLastCampaign = async () => {
  const campaign = await NotificationCampaign.findOne({
    isDeleted: false,
    status: {
      $in: [
        CAMPAIGN_STATUS.SENDING,
        CAMPAIGN_STATUS.SENT,
        CAMPAIGN_STATUS.PARTIAL,
        CAMPAIGN_STATUS.FAILED,
      ],
    },
  })
    .sort({ startedAt: -1, createdAt: -1 })
    .select("title status channels audienceLabel stats startedAt completedAt createdAt")
    .lean();

  if (!campaign) return null;

  const [inApp] = await Notification.aggregate([
    { $match: { campaignId: campaign._id } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        read: { $sum: { $cond: ["$isRead", 1, 0] } },
      },
    },
  ]);

  const stats = campaign.stats || {};

  return {
    id: campaign._id,
    title: campaign.title,
    status: campaign.status,
    channels: campaign.channels || [],
    audienceLabel: campaign.audienceLabel || null,
    sentAt: campaign.completedAt || campaign.startedAt || campaign.createdAt,
    targeted: stats.targeted || 0,
    delivered: (stats.push?.sent || 0) + (stats.email?.sent || 0),
    failed: (stats.push?.failed || 0) + (stats.email?.failed || 0),
    inApp: inApp?.total || 0,
    read: inApp?.read || 0,
  };
};
