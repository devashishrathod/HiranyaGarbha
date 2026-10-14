/* Mirrors server/constants.js -> DASHBOARD_RANGES / DASHBOARD_MAX_CUSTOM_DAYS */

export const DASHBOARD_RANGES = {
  TODAY: "today",
  WEEK: "7d",
  MONTH: "30d",
  YEAR: "12m",
  CUSTOM: "custom",
};

export const DASHBOARD_MAX_CUSTOM_DAYS = 731;

export const RANGE_OPTIONS = [
  { value: DASHBOARD_RANGES.TODAY, label: "Today" },
  { value: DASHBOARD_RANGES.WEEK, label: "7 days" },
  { value: DASHBOARD_RANGES.MONTH, label: "30 days" },
  { value: DASHBOARD_RANGES.YEAR, label: "12 months" },
  { value: DASHBOARD_RANGES.CUSTOM, label: "Custom" },
];

/* What each window's change chip is measured against */
export const COMPARE_LABELS = {
  [DASHBOARD_RANGES.TODAY]: "vs yesterday",
  [DASHBOARD_RANGES.WEEK]: "vs previous 7 days",
  [DASHBOARD_RANGES.MONTH]: "vs previous 30 days",
  [DASHBOARD_RANGES.YEAR]: "vs previous 12 months",
  [DASHBOARD_RANGES.CUSTOM]: "vs previous period",
};

/*
 * Chart colours, taken from the panel's blue / purple / amber theme (the same
 * hues TIER_THEME uses for Basic / Pro / Elite).
 *
 * ⚠️ The series in one chart are also stepped apart in lightness — dark blue,
 * pale violet, mid orange — so they stay distinct for colour-blind readers,
 * where blue and purple of the same depth would merge.
 */
export const CHART_COLORS = {
  revenueFrom: "#2563eb", // blue-600
  revenueTo: "#9333ea", // purple-600
  completed: "#2563eb", // blue-600
  open: "#c4b5fd", // violet-300
  missed: "#f97316", // orange-500
  grid: "#eef0f3",
  axis: "#6b7280", // gray-500
};

export const TIER_CHART = [
  { tier: "basic", label: "Basic", note: "Free with a completed profile", color: "#2563eb" },
  { tier: "pro", label: "Pro", note: "Paid", color: "#c084fc" },
  { tier: "elite", label: "Elite", note: "Paid", color: "#f59e0b" },
];

export const JOURNEY_LABELS = {
  registered: "Registered",
  profileCompleted: "Profile completed",
  booked: "Booked a consultation",
  paid: "Bought a paid plan or course",
};

/* SubscriptionPayment.status -> how the dashboard shows it */
export const PAYMENT_STATUS_META = {
  CREATED: { label: "Awaiting payment", tone: "amber" },
  AUTHORIZED: { label: "Authorised", tone: "blue" },
  CAPTURED: { label: "Paid", tone: "green" },
  FAILED: { label: "Failed", tone: "red" },
  REFUNDED: { label: "Refunded", tone: "slate" },
};

export const CAMPAIGN_STATUS_META = {
  SENDING: { label: "Sending", tone: "blue" },
  SENT: { label: "Sent", tone: "green" },
  PARTIAL: { label: "Partly sent", tone: "amber" },
  FAILED: { label: "Failed", tone: "red" },
};
