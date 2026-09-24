const NotificationCampaign = require("../models/NotificationCampaign");
const { CAMPAIGN_STATUS, NOTIFICATION_LIMITS } = require("../constants");
const { runCampaign } = require("../services/notifications");

/**
 * A campaign left in SENDING for longer than this is not sending — the process
 * that claimed it died mid-run. Nothing will ever complete it, so it is marked
 * failed rather than sitting in the history looking busy forever.
 */
const STALE_AFTER_MS = 30 * 60 * 1000;

// Guards against a slow sweep overlapping the next tick within one process.
// The atomic claim below is what guards against *other* processes.
let running = false;

const sweep = async () => {
  if (running) return;
  running = true;

  try {
    const due = await NotificationCampaign.find({
      status: CAMPAIGN_STATUS.SCHEDULED,
      scheduledAt: { $lte: new Date() },
      isDeleted: false,
    })
      .select("_id")
      .limit(20)
      .lean();

    for (const campaign of due) {
      /**
       * ⚠️ Sequential, not `Promise.all`.
       *
       * Each campaign is itself a bounded-concurrency fan-out to thousands of
       * devices. Running five of those at once multiplies the socket count by
       * five and is how a scheduler takes out the provider connection instead
       * of the other way round.
       *
       * `runCampaign` claims the row atomically and never throws, so a second
       * server instance racing this loop simply finds nothing to claim.
       */
      // eslint-disable-next-line no-await-in-loop
      await runCampaign(campaign._id);
    }

    // Reap anything abandoned by a process that died mid-send.
    const stale = await NotificationCampaign.updateMany(
      {
        status: CAMPAIGN_STATUS.SENDING,
        startedAt: { $lt: new Date(Date.now() - STALE_AFTER_MS) },
      },
      {
        $set: {
          status: CAMPAIGN_STATUS.FAILED,
          completedAt: new Date(),
          error: "The send was interrupted and did not finish.",
        },
      }
    );

    if (stale?.modifiedCount) {
      console.warn(
        `[scheduledCampaigns] marked ${stale.modifiedCount} interrupted campaign(s) as failed`
      );
    }
  } catch (error) {
    // A sweep that throws must not take the interval down with it.
    console.error("[scheduledCampaigns] sweep failed:", error?.message);
  } finally {
    running = false;
  }
};

/**
 * Start the scheduled-campaign sweep.
 *
 * A plain interval rather than a cron dependency: there is one schedule, "every
 * minute", and the thing that actually makes this safe is the atomic claim
 * inside `runCampaign`, not the timer. Two server instances can both run this
 * with no lock table and no Redis — exactly one wins each campaign.
 *
 * `unref()` so the timer never keeps the process alive on shutdown.
 */
exports.startScheduledCampaigns = () => {
  const interval = setInterval(sweep, NOTIFICATION_LIMITS.SCHEDULER_INTERVAL_MS);
  interval.unref?.();

  console.log(
    `🔔 Notification scheduler running every ${
      NOTIFICATION_LIMITS.SCHEDULER_INTERVAL_MS / 1000
    }s`
  );

  return interval;
};

// Exported for a manual run from a script or a test.
exports.sweepScheduledCampaigns = sweep;
