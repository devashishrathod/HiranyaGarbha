const Patient = require("../../models/Patient");
const Subscription = require("../../models/Subscription");
const PatientSubscription = require("../../models/PatientSubscription");
const {
  SUBSCRIPTION_TIERS,
  SUBSCRIPTION_STATUS,
  SUBSCRIPTION_KIND,
  SUBSCRIPTION_PAYMENT_STATUS,
  SUBSCRIPTION_SOURCE,
  PLAN_TRIMESTERS,
} = require("../../constants");
const { pickPlanForTrimester } = require("../../helpers/subscriptions");
const { nextSubscriptionNumber } = require("../../helpers/patientSubscriptions");
const { activateSubscription } = require("./activateSubscription");

/**
 * Give a patient the free Basic package.
 *
 * Called when a profile is completed, and by `scripts/backfillFreeBasic.js`
 * for everyone who signed up before this existed.
 *
 * Why a real row rather than an implicit default: every entitlement check then
 * answers the same way for every patient, paying or not. The alternative —
 * "no subscription means Basic" — is a special case that has to be remembered
 * in each of the dozen places that gate content.
 *
 * ⚠️ Never throws. It runs inside profile completion, which must not fail
 * because the Basic package was renamed or deactivated.
 */
exports.grantFreeBasic = async (patientId, { notify = true } = {}) => {
  try {
    const patient = await Patient.findOne({
      _id: patientId,
      isDeleted: false,
    })
      .select("_id userId")
      .lean();
    if (!patient) return { granted: false, reason: "patient not found" };

    // Any package at all means we must not hand out a second one; the partial
    // unique index would reject it anyway.
    const existing = await PatientSubscription.findOne({
      patientId,
      kind: SUBSCRIPTION_KIND.PACKAGE,
      status: SUBSCRIPTION_STATUS.ACTIVE,
      isDeleted: false,
    })
      .select("_id")
      .lean();
    if (existing) return { granted: false, reason: "already has a package" };

    const basic = await Subscription.findOne({
      tier: SUBSCRIPTION_TIERS.BASIC,
      isDeleted: false,
      isActive: true,
    }).lean();
    if (!basic) return { granted: false, reason: "no basic package on sale" };

    const plan = pickPlanForTrimester(basic.plans, PLAN_TRIMESTERS.ALL);
    if (!plan) return { granted: false, reason: "basic has no plan" };

    const created = await PatientSubscription.create({
      subscriptionNumber: await nextSubscriptionNumber(PatientSubscription),
      patientId: patient._id,
      userId: patient.userId,
      packageId: basic._id,
      kind: SUBSCRIPTION_KIND.PACKAGE,
      tier: basic.tier,
      trimester: plan.trimester,
      snapshot: {
        name: basic.name,
        subtitle: basic.subtitle,
        price: plan.price,
        originalPrice: plan.originalPrice,
        durationInDays: plan.durationInDays,
        modules: basic.modules || [],
        includes: basic.includes || [],
      },
      listPrice: plan.price,
      amountPayable: 0,
      status: SUBSCRIPTION_STATUS.PENDING_PAYMENT,
      paymentStatus: SUBSCRIPTION_PAYMENT_STATUS.NOT_REQUIRED,
      source: SUBSCRIPTION_SOURCE.SYSTEM,
    });

    const activated = await activateSubscription({
      subscription: created,
      amountPaid: 0,
      notify,
    });

    return { granted: true, subscription: activated };
  } catch (error) {
    // Two profile saves racing each other both reach here; the partial unique
    // index rejects the loser, which is exactly the outcome we want.
    if (error?.code === 11000)
      return { granted: false, reason: "already has a package" };

    console.error(
      `[subscriptions] free Basic grant failed for ${patientId}:`,
      error?.message
    );
    return { granted: false, reason: error?.message };
  }
};
