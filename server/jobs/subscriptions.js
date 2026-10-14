const PatientSubscription = require("../models/PatientSubscription");
const {
  SUBSCRIPTION_STATUS,
  SUBSCRIPTION_EXPIRY_SWEEP_MS,
} = require("../constants");
const { lapsedFilter } = require("../helpers/patientSubscriptions");

// Guards against a slow sweep overlapping the next tick within one process.
// The conditional update below is what keeps other processes safe.
let running = false;

/**
 * ACTIVE plans whose period (and grace, for paid plans) is over → EXPIRED.
 *
 * One conditional `updateMany`: idempotent, safe to run on every server
 * instance at once, and it never deletes. A row already moved by another
 * instance simply no longer matches. Expiring a package also frees the
 * one-live-package slot, so the patient can buy or be granted a new one.
 *
 * Phase 4 of docs/SUBSCRIPTIONS.md. Renewal reminders and the "plan expired"
 * notice are not sent from here yet.
 */
const sweepExpiries = async (now = new Date()) => {
  if (running) return { expired: 0, skipped: true };
  running = true;

  try {
    const result = await PatientSubscription.updateMany(lapsedFilter(now), {
      $set: { status: SUBSCRIPTION_STATUS.EXPIRED },
    });

    const expired = result?.modifiedCount || 0;
    if (expired) {
      console.log(`[subscriptions] expired ${expired} plan(s) past their end date`);
    }
    return { expired };
  } catch (error) {
    // A sweep that throws must not take the interval down with it.
    console.error("[subscriptions] expiry sweep failed:", error?.message);
    return { expired: 0, error: error?.message };
  } finally {
    running = false;
  }
};

/**
 * Start the hourly expiry sweep.
 *
 * Runs once straight away as well, so a restart does not leave lapsed plans
 * looking active for up to an hour. A sweep, not a timer per plan: a
 * `setTimeout` set at purchase dies with the process, while this reads the
 * current state and catches up after any downtime.
 */
exports.startSubscriptionJobs = () => {
  sweepExpiries();

  const interval = setInterval(sweepExpiries, SUBSCRIPTION_EXPIRY_SWEEP_MS);
  interval.unref?.();

  console.log(
    `📅 Subscription expiry sweep running every ${SUBSCRIPTION_EXPIRY_SWEEP_MS / 60000} min`
  );

  return interval;
};

// Exported for a manual run from a script or a test.
exports.sweepExpiries = sweepExpiries;
