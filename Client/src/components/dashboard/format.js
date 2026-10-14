import { TIER_OPTIONS, TRIMESTER_LABELS } from "../../constants/subscription";
import { APP_TIMEZONE } from "../../utils/datetime";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const trimZeros = (value, digits) => String(Number(value.toFixed(digits)));

/** ₹1,23,456 — Indian grouping, no paise */
export const formatINR = (value) => inr.format(Number(value) || 0);

/** ₹1.2L / ₹2.55 Cr — for axis ticks and tight tiles */
export const formatCompactINR = (value) => {
  const amount = Number(value) || 0;
  if (amount >= 1e7) return `₹${trimZeros(amount / 1e7, 2)} Cr`;
  if (amount >= 1e5) return `₹${trimZeros(amount / 1e5, 1)}L`;
  if (amount >= 1e3) return `₹${trimZeros(amount / 1e3, 1)}k`;
  return `₹${Math.round(amount)}`;
};

export const formatNumber = (value) => (Number(value) || 0).toLocaleString("en-IN");

export const percentOf = (part, whole) =>
  whole > 0 ? Math.round((part / whole) * 100) : 0;

/** "4 min ago", "3 h ago", then a date */
export const timeAgo = (value) => {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return "";

  const seconds = Math.max(0, Math.round((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} h ago`;
  if (seconds < 7 * 86400) return `${Math.floor(seconds / 86400)} d ago`;

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    timeZone: APP_TIMEZONE,
  }).format(date);
};

const TIER_LABELS = Object.fromEntries(
  TIER_OPTIONS.map(({ value, label }) => [value, label]),
);

/** "Pro · Second Trimester", or the package's own name for bonus courses */
export const planLabel = ({ tier, trimester, planName } = {}) => {
  if (tier === "bonus") return planName || "Bonus course";

  const tierLabel = TIER_LABELS[tier] || planName || "Plan";
  return trimester && trimester !== "all" && TRIMESTER_LABELS[trimester]
    ? `${tierLabel} · ${TRIMESTER_LABELS[trimester]}`
    : tierLabel;
};

/** Hour of the day in the clinic's timezone, for the greeting */
export const clinicHour = () =>
  Number(
    new Intl.DateTimeFormat("en-IN", {
      hour: "numeric",
      hourCycle: "h23",
      timeZone: APP_TIMEZONE,
    }).format(new Date()),
  );

export const longToday = () =>
  new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: APP_TIMEZONE,
  }).format(new Date());
