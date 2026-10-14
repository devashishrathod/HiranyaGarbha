import {
  TIER_OPTIONS,
  TRIMESTER_LABELS,
} from "../../constants/subscription";

const DAY_MS = 24 * 60 * 60 * 1000;

const TIER_LABELS = Object.fromEntries(TIER_OPTIONS.map(({ value, label }) => [value, label]));

export const tierLabel = (tier) => TIER_LABELS[tier] || tier || "—";

export const trimesterLabel = (trimester) =>
  trimester === "all" ? "All trimesters" : TRIMESTER_LABELS[trimester] || trimester || "—";

export const TIER_TONE = { basic: "blue", pro: "purple", elite: "amber", bonus: "teal" };

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export const formatAmount = (value) => inr.format(Number(value) || 0);

/** "12 days left", "Ends today", "Ended 3 days ago" — or "" without a date */
export const periodNote = (endDate) => {
  if (!endDate) return "";
  const days = Math.ceil((new Date(endDate).getTime() - Date.now()) / DAY_MS);
  if (days > 1) return `${days} days left`;
  if (days === 1) return "1 day left";
  if (days === 0) return "Ends today";
  return `Ended ${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} ago`;
};
