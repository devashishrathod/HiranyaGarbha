const NotificationCampaign = require("../../models/NotificationCampaign");
const {
  CAMPAIGN_STATUS,
  NOTIFICATION_CHANNELS,
  ACTIVE_NOTIFICATION_CHANNELS,
} = require("../../constants");
const { resolveAudience } = require("../../helpers/notifications");
const { throwError } = require("../../utils");
const { runCampaign } = require("./runCampaign");

/**
 * Create a broadcast and start it (or queue it for its scheduled time).
 *
 * ⚠️ Delivery is **not** awaited. A broadcast to 1,284 devices is 1,284 HTTPS
 * requests to FCM; at the concurrency this uses that is well over a minute,
 * far past any sane HTTP timeout. The campaign row is written synchronously so
 * the admin sees it in History immediately with status `SENDING`, and the panel
 * re-polls while anything is in that state.
 *
 * The audience is validated *before* the row is created, so an impossible send
 * is a 422 the admin can act on rather than a `FAILED` row they have to go
 * looking for.
 */
exports.createCampaign = async (payload, adminUserId) => {
  const channels = (payload.channels || []).filter((channel) =>
    ACTIVE_NOTIFICATION_CHANNELS.includes(channel)
  );

  if (!channels.length) {
    throwError(
      422,
      "Pick at least one deliverable channel. SMS and WhatsApp are not connected yet."
    );
  }

  /**
   * Counted, not fetched.
   *
   * `countOnly` skips loading and enriching every recipient document — this
   * call only needs to know whether the audience is sane. `runCampaign`
   * resolves it properly a moment later, and for a scheduled campaign that
   * happens days from now against a different set of people anyway.
   */
  const audience = await resolveAudience(payload.audience, { countOnly: true });

  if (!audience.total) {
    throwError(422, "That audience does not match anybody.");
  }

  if (audience.truncated) {
    throwError(
      422,
      `That audience resolves to ${audience.total} recipients, over the ${audience.cap} limit for a single send. Narrow the filter or split it up.`
    );
  }

  const scheduledAt = payload.scheduledAt ? new Date(payload.scheduledAt) : null;

  if (scheduledAt && scheduledAt.getTime() <= Date.now()) {
    throwError(422, "The scheduled time has already passed.");
  }

  const campaign = await NotificationCampaign.create({
    title: payload.title,
    body: payload.body,
    imageUrl: payload.imageUrl,
    deepLink: payload.deepLink,
    subject: payload.subject,
    emailBody: payload.emailBody,
    channels,
    audience: payload.audience,
    audienceLabel: audience.label,
    scheduledAt,
    status: scheduledAt ? CAMPAIGN_STATUS.SCHEDULED : CAMPAIGN_STATUS.SENDING,
    stats: { targeted: audience.total, unmatched: audience.unmatched || 0 },
    createdBy: adminUserId,
  });

  if (!scheduledAt) {
    /**
     * Fire and forget, deliberately.
     *
     * `runCampaign` never throws and writes its own outcome onto the campaign
     * row, so there is nothing here to catch and nothing lost by not waiting.
     * The `.catch` is belt-and-braces against an unhandled rejection taking
     * the process down.
     */
    runCampaign(campaign._id).catch((error) =>
      console.error(`[createCampaign] ${campaign._id} failed:`, error?.message)
    );
  }

  return {
    campaign: campaign.toObject(),
    audience: {
      total: audience.total,
      label: audience.label,
      unmatched: audience.unmatched || 0,
      externalEmails: audience.externalEmails?.length || 0,
    },
    // What the admin actually gets, given the channels they picked and what is
    // wired up. Surfaced so the panel can say "queued for push and in-app"
    // rather than implying SMS went out too.
    deliveringOn: channels,
    pushRequested: channels.includes(NOTIFICATION_CHANNELS.PUSH),
  };
};
