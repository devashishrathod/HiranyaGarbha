const moment = require("moment-timezone");
const { GRACE_DAYS } = require("../../constants");

const TZ = "Asia/Kolkata";

/*
 * Periods are computed from our clock, in IST, at activation time — never from
 * a timestamp the gateway or the client supplies. A patient who pays at 23:55
 * and a webhook that lands at 00:05 must not disagree about which day the plan
 * started.
 */
const buildPeriod = (durationInDays, from = new Date()) => {
  const start = moment.tz(from, TZ);
  const days = Number(durationInDays) || 0;

  const end = start.clone().add(days, "days").endOf("day");

  return {
    startDate: start.toDate(),
    endDate: end.toDate(),
    // Free plans get no grace: there is nothing to renew and no payment to wait
    // for, so the banner it drives would never be actionable.
    graceUntil: days > 0 ? end.clone().add(GRACE_DAYS, "days").toDate() : null,
  };
};

/*
 * A renewal bought while the current plan is still running starts the day
 * after it ends, so no paid day is thrown away.
 */
const buildFollowOnPeriod = (durationInDays, previousEndDate) => {
  const start = moment.tz(previousEndDate, TZ).add(1, "day").startOf("day");
  return buildPeriod(durationInDays, start.toDate());
};

const daysBetween = (from, to) =>
  moment.tz(to, TZ).startOf("day").diff(moment.tz(from, TZ).startOf("day"), "days");

const daysRemaining = (endDate, now = new Date()) =>
  Math.max(daysBetween(now, endDate), 0);

/* Inside the period, or inside the grace window that follows it. */
const isWithinPeriod = (subscription, now = new Date()) => {
  if (!subscription?.endDate) return false;
  return new Date(now) <= new Date(subscription.endDate);
};

const isInGrace = (subscription, now = new Date()) => {
  if (!subscription?.endDate || !subscription?.graceUntil) return false;
  const at = new Date(now);
  return at > new Date(subscription.endDate) && at <= new Date(subscription.graceUntil);
};

module.exports = {
  TZ,
  buildPeriod,
  buildFollowOnPeriod,
  daysBetween,
  daysRemaining,
  isWithinPeriod,
  isInGrace,
};
