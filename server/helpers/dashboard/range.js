const moment = require("moment-timezone");
const { DASHBOARD_RANGES, DASHBOARD_MAX_CUSTOM_DAYS } = require("../../constants");
const { TZ } = require("../patientSubscriptions/period");
const { throwError } = require("../../utils");

/*
 * How one chart point is keyed. `mongo` and `moment` must describe the same
 * string, because the aggregation groups by one and the empty-bucket filler
 * walks the window with the other.
 */
const BUCKETS = Object.freeze({
  hour: { unit: "hour", mongo: "%Y-%m-%d %H", moment: "YYYY-MM-DD HH", label: "h A" },
  day: { unit: "day", mongo: "%Y-%m-%d", moment: "YYYY-MM-DD", label: "D MMM" },
  month: { unit: "month", mongo: "%Y-%m", moment: "YYYY-MM", label: "MMM YY" },
});

const PRESETS = Object.freeze({
  [DASHBOARD_RANGES.TODAY]: { label: "Today", bucket: "hour", shift: [1, "day"] },
  [DASHBOARD_RANGES.WEEK]: { label: "Last 7 days", bucket: "day", shift: [7, "days"], days: 7 },
  [DASHBOARD_RANGES.MONTH]: { label: "Last 30 days", bucket: "day", shift: [30, "days"], days: 30 },
  [DASHBOARD_RANGES.YEAR]: { label: "Last 12 months", bucket: "month", shift: [12, "months"] },
});

const bucketForDays = (days) => {
  if (days <= 1) return "hour";
  if (days <= 92) return "day";
  return "month";
};

/**
 * The window a dashboard request covers, and the one it is compared against.
 *
 * ⚠️ Everything is cut in IST, not UTC. "Today" for an admin in Pune starts at
 * 00:00 IST; cutting at UTC midnight would put the 00:00–05:30 bookings on the
 * wrong day and make the hourly chart start at 5:30 AM.
 *
 * ⚠️ The previous window is the current one shifted back by its own length
 * (a day, 7 days, 12 months), not "the same number of milliseconds before
 * `start`". Today at 10:00 is compared with yesterday 00:00–10:00, which is a
 * like-for-like comparison; the millisecond version would compare it with
 * yesterday 14:00–24:00.
 */
exports.resolveRange = ({ range, from, to }, now = new Date()) => {
  const key =
    range === DASHBOARD_RANGES.CUSTOM || PRESETS[range] ? range : DASHBOARD_RANGES.MONTH;
  const current = moment.tz(now, TZ);
  const today = current.clone().startOf("day");

  let start;
  let end = current.clone();
  let label;
  let bucket;
  let shift;

  if (key === DASHBOARD_RANGES.CUSTOM) {
    start = moment.tz(from, "YYYY-MM-DD", true, TZ).startOf("day");
    end = moment.tz(to, "YYYY-MM-DD", true, TZ).endOf("day");

    if (!start.isValid() || !end.isValid()) {
      throwError(422, "Pick a valid start and end date");
    }
    if (end.isBefore(start)) {
      throwError(422, "The end date must be on or after the start date");
    }

    const days = end.clone().startOf("day").diff(start, "days") + 1;
    if (days > DASHBOARD_MAX_CUSTOM_DAYS) {
      throwError(422, `Pick a range of at most ${DASHBOARD_MAX_CUSTOM_DAYS} days`);
    }

    bucket = bucketForDays(days);
    shift = [days, "days"];
    label =
      days === 1
        ? start.format("D MMM YYYY")
        : `${start.format("D MMM YYYY")} – ${end.format("D MMM YYYY")}`;
  } else {
    const preset = PRESETS[key];

    if (preset.bucket === "hour") start = today.clone();
    else if (preset.bucket === "month") start = today.clone().startOf("month").subtract(11, "months");
    else start = today.clone().subtract(preset.days - 1, "days");

    ({ label, bucket, shift } = preset);
  }

  return {
    key,
    label,
    bucket,
    start: start.toDate(),
    end: end.toDate(),
    previous: {
      start: start.clone().subtract(...shift).toDate(),
      end: end.clone().subtract(...shift).toDate(),
    },
    today: { start: today.toDate(), end: today.clone().endOf("day").toDate() },
    now: current.toDate(),
  };
};

/** The `$group` key that drops a date into its chart bucket, in IST. */
exports.bucketKey = (dateExpression, bucket) => ({
  $dateToString: { format: BUCKETS[bucket].mongo, date: dateExpression, timezone: TZ },
});

/**
 * One point per bucket across the whole window, zero-filled.
 *
 * Aggregations only return buckets that had something in them; a chart drawn
 * straight from that would join Monday to Thursday and hide the quiet days.
 *
 * `rows` are `{ _id: <bucket key>, ...values }`; `empty` is the shape of a
 * point with nothing in it.
 */
exports.fillSeries = (range, rows, empty) => {
  const { unit, moment: format, label } = BUCKETS[range.bucket];
  const byKey = new Map(rows.map(({ _id, ...values }) => [_id, values]));

  const points = [];
  const cursor = moment.tz(range.start, TZ).startOf(unit);
  const last = moment.tz(range.end, TZ);

  while (cursor.isSameOrBefore(last)) {
    const key = cursor.format(format);
    points.push({ key, label: cursor.format(label), ...empty, ...byKey.get(key) });
    cursor.add(1, unit);
  }

  return points;
};

/** Percent change, or null when there is nothing to compare against. */
exports.percentChange = (current, previous) => {
  if (!previous) return null;
  return Math.round(((current - previous) / previous) * 1000) / 10;
};
