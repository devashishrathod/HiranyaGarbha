const PatientSubscription = require("../../models/PatientSubscription");
const {
  SUBSCRIPTION_STATUS,
  SUBSCRIPTION_KIND,
  SUBSCRIPTION_TIERS,
} = require("../../constants");
const {
  isInGrace,
  daysRemaining,
} = require("../../helpers/patientSubscriptions");

/**
 * The one question every gated screen asks: what is this patient allowed to see?
 *
 * Deliberately small and free of joins — it runs on module screens, video
 * lists and consultation booking, so it reads one indexed query and returns
 * flat values the client can cache.
 *
 * Because free Basic is granted as a real row at profile completion, there is
 * no "no row means Basic" special case here. Every patient has a package.
 */
exports.getEntitlement = async (patientId) => {
  const rows = await PatientSubscription.find({
    patientId,
    isDeleted: false,
    status: {
      $in: [SUBSCRIPTION_STATUS.ACTIVE, SUBSCRIPTION_STATUS.CANCELLED],
    },
    endDate: { $gte: new Date() },
  })
    .select("kind tier packageId endDate graceUntil snapshot.name")
    .lean();

  const pkg = rows.find((row) => row.kind === SUBSCRIPTION_KIND.PACKAGE);

  return {
    hasActivePlan: Boolean(pkg),
    tier: pkg?.tier || null,
    planName: pkg?.snapshot?.name || null,
    packageId: pkg?.packageId || null,
    endDate: pkg?.endDate || null,
    daysRemaining: pkg ? daysRemaining(pkg.endDate) : 0,
    inGrace: pkg ? isInGrace(pkg) : false,
    // Anything above Basic. What a "premium content" check actually wants.
    isPaid: Boolean(pkg && pkg.tier !== SUBSCRIPTION_TIERS.BASIC),
    bonusCourseIds: rows
      .filter((row) => row.kind === SUBSCRIPTION_KIND.BONUS)
      .map((row) => row.packageId),
  };
};
