/* Mirrors server/constants.js -> SUBSCRIPTION_TIERS / PLAN_TRIMESTERS */

export const SUBSCRIPTION_TIERS = {
  BASIC: "basic",
  PRO: "pro",
  ELITE: "elite",
  BONUS: "bonus",
};

export const TIER_OPTIONS = [
  { value: SUBSCRIPTION_TIERS.BASIC, label: "Basic" },
  { value: SUBSCRIPTION_TIERS.PRO, label: "Pro" },
  { value: SUBSCRIPTION_TIERS.ELITE, label: "Elite" },
  { value: SUBSCRIPTION_TIERS.BONUS, label: "Bonus Course" },
];

export const PLAN_TRIMESTERS = {
  ALL: "all",
  FIRST: "first",
  SECOND: "second",
  THIRD: "third",
};

export const TRIMESTER_LABELS = {
  all: "All Trimesters",
  first: "First Trimester",
  second: "Second Trimester",
  third: "Third Trimester",
};

/* Tabs on the packages screen; "all" is not a tab, it is the fallback a
   package without trimester pricing (the free Basic one) resolves to. */
export const TRIMESTER_TABS = [
  PLAN_TRIMESTERS.FIRST,
  PLAN_TRIMESTERS.SECOND,
  PLAN_TRIMESTERS.THIRD,
];

/* How many days of the journey each trimester plan still covers */
export const TRIMESTER_DURATION_DAYS = {
  all: 90,
  first: 270,
  second: 180,
  third: 90,
};

/* Fallback gradients so a package saved without a theme still renders */
export const TIER_THEME = {
  basic: { color: "from-blue-500 to-blue-600", borderColor: "border-blue-500" },
  pro: {
    color: "from-purple-500 to-purple-600",
    borderColor: "border-purple-500",
  },
  elite: {
    color: "from-amber-500 to-orange-500",
    borderColor: "border-amber-500",
  },
  bonus: {
    color: "from-green-500 to-blue-500",
    borderColor: "border-green-500",
  },
};

export const getTierTheme = (pkg) => ({
  color: pkg?.theme?.color || TIER_THEME[pkg?.tier]?.color || TIER_THEME.basic.color,
  borderColor:
    pkg?.theme?.borderColor ||
    TIER_THEME[pkg?.tier]?.borderColor ||
    TIER_THEME.basic.borderColor,
});

export const formatPrice = (value) => {
  if (value === 0) return "FREE";
  if (typeof value !== "number" || Number.isNaN(value)) return "-";
  return `₹${value.toLocaleString("en-IN")}`;
};
