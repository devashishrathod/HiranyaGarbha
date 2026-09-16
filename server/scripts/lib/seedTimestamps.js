const moment = require("moment-timezone");

const TZ = "Asia/Kolkata";
const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

/*
 * Deterministic 0..1 from a string, so re-running a seed reproduces exactly
 * the same dates instead of reshuffling the whole table every time.
 */
const unitRandom = (...parts) => {
  const key = parts.join(":");
  let hash = 2166136261;

  for (let i = 0; i < key.length; i += 1) {
    hash ^= key.charCodeAt(i);
    hash = Math.imul(hash, 16777619) >>> 0;
  }

  return hash / 4294967296;
};

/*
 * Every seeded row otherwise lands on the minute the script ran, which reads
 * as fake in any list sorted by date. This spreads createdAt evenly across
 * [from, to] at varied times of day, and gives each row an updatedAt somewhere
 * after it but never past `until`.
 */
const spreadTimestamps = ({
  count,
  from,
  to,
  until,
  salt,
  editedWithinDays = 18,
}) => {
  const start = moment.tz(from, TZ).startOf("day").valueOf();
  const end = moment.tz(to, TZ).endOf("day").valueOf();
  const cap = moment.tz(until, TZ).valueOf();
  const step = (end - start) / Math.max(count, 1);

  return Array.from({ length: count }, (_, index) => {
    const jitter = (unitRandom(salt, index, "jitter") - 0.5) * step * 0.7;
    const slot = Math.min(Math.max(start + step * (index + 0.5) + jitter, start), end);

    // Working hours, so the timestamps read like real admin activity
    const createdAt = moment
      .tz(slot, TZ)
      .hour(9 + Math.floor(unitRandom(salt, index, "hour") * 12))
      .minute(Math.floor(unitRandom(salt, index, "minute") * 60))
      .second(Math.floor(unitRandom(salt, index, "second") * 60))
      .millisecond(0)
      .toDate();

    return {
      createdAt,
      updatedAt: editedAfter(createdAt, cap, unitRandom(salt, index, "edit"), editedWithinDays),
    };
  });
};

// At least an hour after it was created, at most `until`
const editedAfter = (createdAt, cap, roll, withinDays) => {
  const room = Math.max(cap - createdAt.getTime(), 2 * HOUR);
  const gap = HOUR + roll * Math.min(withinDays * DAY, room - HOUR);

  return new Date(createdAt.getTime() + gap);
};

/* A single timestamp somewhere inside [lo, hi], deterministic per key */
const momentBetween = (lo, hi, ...key) => {
  const low = lo instanceof Date ? lo.getTime() : lo;
  const high = hi instanceof Date ? hi.getTime() : hi;

  if (high <= low) return new Date(low);

  return new Date(low + unitRandom(...key) * (high - low));
};

/*
 * Written through the raw driver on purpose: a Mongoose update would stamp
 * updatedAt with the current time and undo what we just calculated.
 */
const applyTimestamps = async (Model, ids, stamps) => {
  for (let index = 0; index < ids.length; index += 1) {
    if (!ids[index] || !stamps[index]) continue;

    await Model.collection.updateOne(
      { _id: ids[index] },
      { $set: stamps[index] }
    );
  }

  return ids.length;
};

module.exports = {
  TZ,
  HOUR,
  DAY,
  unitRandom,
  spreadTimestamps,
  momentBetween,
  applyTimestamps,
};
