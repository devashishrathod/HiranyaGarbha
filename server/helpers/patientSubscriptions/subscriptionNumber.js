const moment = require("moment-timezone");
const { TZ } = require("./period");

/**
 * A short, human-quotable reference: SUB-20260925-000148.
 *
 * Counted per day rather than globally so the number stays short, and derived
 * from a count rather than a random string so support can read it back over a
 * phone call without ambiguity. The unique index on the column is the real
 * guard: a same-millisecond collision loses the insert and is retried.
 */
const nextSubscriptionNumber = async (Model) => {
  const today = moment.tz(TZ);
  const stamp = today.format("YYYYMMDD");

  const startOfDay = today.clone().startOf("day").toDate();
  const endOfDay = today.clone().endOf("day").toDate();

  const soFar = await Model.countDocuments({
    createdAt: { $gte: startOfDay, $lte: endOfDay },
  });

  return `SUB-${stamp}-${String(soFar + 1).padStart(6, "0")}`;
};

module.exports = { nextSubscriptionNumber };
