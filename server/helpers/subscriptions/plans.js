const {
  DURATION_MAP,
  PLAN_TRIMESTERS,
  TRIMESTER_LABELS,
  TRIMESTER_DURATION_DAYS,
} = require("../../constants");
const { throwError } = require("../../utils");

// Case-insensitive exact match, used for the duplicate-name lookups
const CASE_INSENSITIVE = { locale: "en", strength: 2 };

const isEmpty = (value) =>
  value === "" || value === null || typeof value === "undefined";

/*
 * Admin only sends the trimester and the price for each plan; the label and
 * the number of days that trimester still covers are filled in here so the
 * API, the seed script and the panel all end up with the same defaults.
 */
const normalizePlans = (plans) => {
  if (!Array.isArray(plans)) return null;
  if (!plans.length) throwError(400, "At least one plan is required");

  const seen = new Set();

  return plans.map((plan) => {
    const trimester = plan?.trimester || PLAN_TRIMESTERS.ALL;

    if (!Object.values(PLAN_TRIMESTERS).includes(trimester))
      throwError(400, `Invalid trimester "${trimester}" in plans`);

    if (seen.has(trimester))
      throwError(409, `Duplicate plan for ${TRIMESTER_LABELS[trimester]}`);
    seen.add(trimester);

    const price = Number(plan?.price);
    if (!Number.isFinite(price) || price < 0)
      throwError(400, `Invalid price for ${TRIMESTER_LABELS[trimester]}`);

    const originalPrice = isEmpty(plan?.originalPrice)
      ? undefined
      : Number(plan.originalPrice);

    if (typeof originalPrice === "number" && !Number.isFinite(originalPrice))
      throwError(
        400,
        `Invalid original price for ${TRIMESTER_LABELS[trimester]}`
      );

    return {
      trimester,
      label: plan?.label?.trim() || TRIMESTER_LABELS[trimester],
      price,
      originalPrice,
      durationInDays:
        Number(plan?.durationInDays) || TRIMESTER_DURATION_DAYS[trimester],
      isActive: plan?.isActive !== false,
    };
  });
};

const activePlans = (plans = []) => {
  const active = plans.filter((plan) => plan?.isActive !== false);
  return active.length ? active : plans;
};

// "Starting from" price, used by the table and by sorting.
const cheapestPlan = (plans = []) =>
  activePlans(plans).reduce(
    (cheapest, plan) =>
      !cheapest || plan.price < cheapest.price ? plan : cheapest,
    null
  );

/*
 * Which plan a mother actually sees. A package without a plan for her
 * trimester falls back to its "all trimesters" plan - that is how the free
 * Basic package prices the same in every tab.
 */
const pickPlanForTrimester = (plans = [], trimester) => {
  const pool = activePlans(plans);
  if (!trimester) return cheapestPlan(pool);

  return (
    pool.find((plan) => plan.trimester === trimester) ||
    pool.find((plan) => plan.trimester === PLAN_TRIMESTERS.ALL) ||
    cheapestPlan(pool)
  );
};

const applyPlanDerivedFields = (target, plans) => {
  const plan = cheapestPlan(plans);
  if (!plan) return target;

  target.price = plan.price;
  target.originalPrice = plan.originalPrice;
  target.durationInDays = plan.durationInDays;
  return target;
};

const computeDurationFromType = (type) => {
  const days = DURATION_MAP[type];
  if (!days)
    throwError(400, "Invalid subscription type for duration calculation");
  return days;
};

module.exports = {
  CASE_INSENSITIVE,
  normalizePlans,
  cheapestPlan,
  pickPlanForTrimester,
  applyPlanDerivedFields,
  computeDurationFromType,
};
