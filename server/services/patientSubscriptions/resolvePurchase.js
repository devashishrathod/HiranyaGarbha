const Patient = require("../../models/Patient");
const Subscription = require("../../models/Subscription");
const PatientSubscription = require("../../models/PatientSubscription");
const {
  SUBSCRIPTION_STATUS,
  SUBSCRIPTION_TIERS,
  SUBSCRIPTION_KIND,
} = require("../../constants");
const { throwError, validateObjectId } = require("../../utils");
const { pickPlanForTrimester } = require("../../helpers/subscriptions");
const { quote } = require("../../helpers/patientSubscriptions");

/**
 * Everything a purchase needs, resolved and priced, before anything is written.
 *
 * Shared by `previewCheckout` and `createCheckout` on purpose: the quote a
 * patient is shown and the amount they are charged come from one code path, so
 * they cannot drift apart. See docs/SUBSCRIPTIONS.md §7.
 */
exports.resolvePurchase = async ({ patientId, packageId, trimester }) => {
  validateObjectId(patientId, "Patient Id");
  validateObjectId(packageId, "Package Id");

  const patient = await Patient.findOne({
    _id: patientId,
    isDeleted: false,
  }).lean();
  if (!patient) throwError(404, "Patient not found");

  const pkg = await Subscription.findOne({
    _id: packageId,
    isDeleted: false,
    isActive: true,
  }).lean();
  if (!pkg) throwError(404, "Package not found or no longer on sale");

  const plan = pickPlanForTrimester(pkg.plans, trimester);
  if (!plan)
    throwError(422, `${pkg.name} has no plan for the ${trimester} trimester`);

  const kind =
    pkg.tier === SUBSCRIPTION_TIERS.BONUS
      ? SUBSCRIPTION_KIND.BONUS
      : SUBSCRIPTION_KIND.PACKAGE;

  /*
   * A bonus course never displaces the main package and never earns a credit
   * from it — the two stack. Only a core package looks at what is running.
   */
  const current =
    kind === SUBSCRIPTION_KIND.PACKAGE
      ? await PatientSubscription.findOne({
          patientId,
          kind: SUBSCRIPTION_KIND.PACKAGE,
          status: SUBSCRIPTION_STATUS.ACTIVE,
          isDeleted: false,
        }).lean()
      : null;

  if (current && String(current.packageId) === String(packageId))
    throwError(409, `${pkg.name} is already active for this patient`);

  if (kind === SUBSCRIPTION_KIND.BONUS) {
    const ownsCourse = await PatientSubscription.findOne({
      patientId,
      packageId,
      status: SUBSCRIPTION_STATUS.ACTIVE,
      isDeleted: false,
    }).lean();
    if (ownsCourse) throwError(409, `${pkg.name} is already active`);
  }

  const pricing = quote({ plan, current });

  return {
    patient,
    pkg,
    plan,
    kind,
    current,
    pricing,
    // Frozen here, not read live at activation: editing the package in
    // September must not rewrite what was sold in July.
    snapshot: {
      name: pkg.name,
      subtitle: pkg.subtitle,
      price: plan.price,
      originalPrice: plan.originalPrice,
      durationInDays: plan.durationInDays,
      modules: pkg.modules || [],
      includes: pkg.includes || [],
    },
  };
};
