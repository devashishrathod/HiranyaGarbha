const NotificationCampaign = require("../../models/NotificationCampaign");
const { CAMPAIGN_STATUS, NOTIFICATION_TYPES } = require("../../constants");
const { resolveAudience, notifyAudience } = require("../../helpers/notifications");

/**
 * Send one campaign.
 *
 * Called two ways — straight after creation for a send-now campaign, and by the
 * scheduler sweep for a due one — so it has to be safe to invoke twice on the
 * same row.
 *
 * ⚠️ **The atomic claim is what makes that safe**, not the caller. Two server
 * instances both running the scheduler will race on the same campaign; exactly
 * one wins the `findOneAndUpdate` and the other gets `null` and returns. No
 * Redis, no lock collection, no cron-expression dependency.
 *
 * ⚠️ **Never throws.** A failed campaign is a campaign row with
 * `status: FAILED` and an error on it — something the admin can see in History
 * and retry — not an unhandled rejection in a background task nobody is
 * awaiting.
 *
 * @param {string} campaignId
 * @returns {Promise<{ran:boolean, reason?:string, campaign?:object}>}
 */
exports.runCampaign = async (campaignId) => {
  // Claim it. Only a campaign that is waiting to go can be picked up, which is
  // also what stops a cancelled one from being sent by an in-flight sweep.
  const campaign = await NotificationCampaign.findOneAndUpdate(
    {
      _id: campaignId,
      status: { $in: [CAMPAIGN_STATUS.SCHEDULED, CAMPAIGN_STATUS.SENDING] },
    },
    { $set: { status: CAMPAIGN_STATUS.SENDING, startedAt: new Date() } },
    { new: true }
  );

  if (!campaign) {
    return { ran: false, reason: "already running, cancelled or not found" };
  }

  try {
    /**
     * Resolved **now**, not at compose time.
     *
     * A campaign scheduled for next week and aimed at "all active patients"
     * must reach the patients who exist when it runs. That is the whole reason
     * the audience is stored declaratively.
     */
    const audience = await resolveAudience(campaign.audience.toObject?.() || campaign.audience);

    if (audience.truncated) {
      await NotificationCampaign.updateOne(
        { _id: campaign._id },
        {
          $set: {
            status: CAMPAIGN_STATUS.FAILED,
            completedAt: new Date(),
            error: `Audience grew to ${audience.total} recipients, over the ${audience.cap} limit.`,
            "stats.targeted": audience.total,
          },
        }
      );
      return { ran: false, reason: "audience over the limit" };
    }

    if (!audience.total) {
      await NotificationCampaign.updateOne(
        { _id: campaign._id },
        {
          $set: {
            status: CAMPAIGN_STATUS.FAILED,
            completedAt: new Date(),
            error: "The audience resolved to nobody.",
            "stats.targeted": 0,
          },
        }
      );
      return { ran: false, reason: "empty audience" };
    }

    const stats = await notifyAudience({
      users: audience.users,
      externalEmails: audience.externalEmails,
      type: NOTIFICATION_TYPES.ANNOUNCEMENT,
      title: campaign.title,
      body: campaign.body,
      subject: campaign.subject,
      emailBody: campaign.emailBody,
      channels: campaign.channels,
      imageUrl: campaign.imageUrl,
      deepLink: campaign.deepLink,
      campaignId: campaign._id,
      meta: { campaignId: String(campaign._id) },
    });

    /**
     * Anything that was attempted and did not land makes this partial.
     *
     * `noDevice` is deliberately **not** in that list: a patient who has never
     * opened the mobile app has no token to push to, and counting that as a
     * delivery failure would mark almost every early campaign as partial and
     * train the admin to ignore the status.
     */
    const failures = (stats.push?.failed || 0) + (stats.email?.failed || 0);
    const status =
      stats.created === 0
        ? CAMPAIGN_STATUS.FAILED
        : failures > 0
          ? CAMPAIGN_STATUS.PARTIAL
          : CAMPAIGN_STATUS.SENT;

    const updated = await NotificationCampaign.findByIdAndUpdate(
      campaign._id,
      {
        $set: {
          status,
          completedAt: new Date(),
          audienceLabel: audience.label,
          stats: {
            targeted: audience.total,
            created: stats.created,
            duplicates: stats.duplicates,
            push: stats.push,
            email: stats.email,
            unmatched: audience.unmatched || 0,
          },
          ...(stats.created === 0
            ? { error: "No notification rows could be written." }
            : {}),
        },
      },
      { new: true }
    ).lean();

    return { ran: true, campaign: updated };
  } catch (error) {
    console.error(`[runCampaign] ${campaignId} failed:`, error?.message);

    await NotificationCampaign.updateOne(
      { _id: campaignId },
      {
        $set: {
          status: CAMPAIGN_STATUS.FAILED,
          completedAt: new Date(),
          error: error?.message || "unknown error",
        },
      }
    ).catch(() => null);

    return { ran: false, reason: error?.message };
  }
};
