/**
 * The backend stores appointment slots against a clinic timezone (Asia/Kolkata
 * by default) so every screen formats in that zone rather than the browser's,
 * otherwise an admin sitting abroad would read shifted slot timings.
 */
export const APP_TIMEZONE = "Asia/Kolkata";

const toDate = (value) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const formatDate = (value, timeZone = APP_TIMEZONE) => {
  const date = toDate(value);
  if (!date) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone,
  }).format(date);
};

export const formatTime = (value, timeZone = APP_TIMEZONE) => {
  const date = toDate(value);
  if (!date) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone,
  }).format(date);
};

export const formatDateTime = (value, timeZone = APP_TIMEZONE) => {
  const date = toDate(value);
  if (!date) return "—";
  return `${formatDate(date, timeZone)}, ${formatTime(date, timeZone)}`;
};

export const formatTimeRange = (start, end, timeZone = APP_TIMEZONE) => {
  const from = toDate(start);
  if (!from) return "—";
  const to = toDate(end);
  return to
    ? `${formatTime(from, timeZone)} – ${formatTime(to, timeZone)}`
    : formatTime(from, timeZone);
};

/** YYYY-MM-DD in the given timezone, ready for <input type="date"> */
export const toDateInputValue = (value, timeZone = APP_TIMEZONE) => {
  const date = toDate(value) || new Date();

  // en-CA renders as YYYY-MM-DD
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone,
  }).format(date);
};

export const todayInputValue = () => toDateInputValue(new Date());

/** "Today" / "Tomorrow" / "Yesterday", otherwise the formatted date */
export const relativeDay = (value, timeZone = APP_TIMEZONE) => {
  const date = toDate(value);
  if (!date) return "—";

  const target = toDateInputValue(date, timeZone);
  const today = new Date();

  if (target === toDateInputValue(today, timeZone)) return "Today";

  const tomorrow = new Date(today.getTime() + 86400000);
  if (target === toDateInputValue(tomorrow, timeZone)) return "Tomorrow";

  const yesterday = new Date(today.getTime() - 86400000);
  if (target === toDateInputValue(yesterday, timeZone)) return "Yesterday";

  return formatDate(date, timeZone);
};

/** Whole years between a date of birth and today */
export const ageFromDob = (dob) => {
  const date = toDate(dob);
  if (!date) return null;

  const now = new Date();
  let age = now.getFullYear() - date.getFullYear();
  const monthDelta = now.getMonth() - date.getMonth();

  if (monthDelta < 0 || (monthDelta === 0 && now.getDate() < date.getDate())) {
    age -= 1;
  }

  return age >= 0 && age < 130 ? age : null;
};

export const isPast = (value) => {
  const date = toDate(value);
  return date ? date.getTime() < Date.now() : false;
};
