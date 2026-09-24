const NotificationCampaign = require("../../models/NotificationCampaign");
const { CAMPAIGN_STATUS } = require("../../constants");
const { throwError } = require("../../utils");

/**
 * Cancel a campaign that has not gone out yet.
 *
 * ⚠️ The status guard is inside the `findOneAndUpdate` filter, not an `if`
 * above it. The scheduler sweep can claim a due campaign at any moment, and a
 * read-then-write here would leave a window where both succeed — the admin
 * told it was cancelled while the sweep is already pushing.
 *
 * Whichever lands first wins, and the loser gets `null`.
 */
exports.cancelCampaign = async (id) => {
  const campaign = await NotificationCampaign.findOneAndUpdate(
    { _id: id, isDeleted: false, status: CAMPAIGN_STATUS.SCHEDULED },
    { $set: { status: CAMPAIGN_STATUS.CANCELLED, completedAt: new Date() } },
    { new: true }
  ).lean();

  if (campaign) return campaign;

  // Say why it could not be cancelled rather than a bare 404.
  const existing = await NotificationCampaign.findById(id)
    .select("status")
    .lean();

  if (!existing) throwError(404, "Notification campaign not found");

  throwError(
    409,
    `Only a scheduled campaign can be cancelled — this one is already ${existing.status.toLowerCase()}.`
  );
};
