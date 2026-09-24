const PatientSubscription = require("../../models/PatientSubscription");
const {
  SUBSCRIPTION_STATUS,
  SUBSCRIPTION_KIND,
} = require("../../constants");
const { pagination } = require("../../utils");
const {
  isInGrace,
  daysRemaining,
  grantsAccess,
} = require("../../helpers/patientSubscriptions");

/* The shape every screen reads, computed once rather than in each component. */
const decorate = (row) => {
  if (!row) return null;

  return {
    ...row,
    daysRemaining: daysRemaining(row.endDate),
    inGrace: isInGrace(row),
    hasAccess: grantsAccess(row),
  };
};

/**
 * What this patient holds right now: the core package and any bonus courses.
 *
 * `CANCELLED` rows still surface while inside their period — the patient paid
 * for it, so hiding it would be lying about what they can use.
 */
exports.getMySubscriptions = async (patientId) => {
  const live = await PatientSubscription.find({
    patientId,
    isDeleted: false,
    status: {
      $in: [SUBSCRIPTION_STATUS.ACTIVE, SUBSCRIPTION_STATUS.CANCELLED],
    },
    endDate: { $gte: new Date() },
  })
    .sort({ endDate: -1 })
    .lean();

  const pending = await PatientSubscription.find({
    patientId,
    isDeleted: false,
    status: SUBSCRIPTION_STATUS.PENDING_PAYMENT,
  })
    .sort({ createdAt: -1 })
    .lean();

  return {
    package:
      decorate(live.find((row) => row.kind === SUBSCRIPTION_KIND.PACKAGE)) ||
      null,
    bonusCourses: live
      .filter((row) => row.kind === SUBSCRIPTION_KIND.BONUS)
      .map(decorate),
    // So the app can offer "complete your payment" instead of starting over.
    pendingCheckouts: pending.map((row) => ({
      _id: row._id,
      subscriptionNumber: row.subscriptionNumber,
      name: row.snapshot?.name,
      amountPayable: row.amountPayable,
      orderId: row.gateway?.orderId,
      createdAt: row.createdAt,
    })),
  };
};

exports.getMyHistory = async (patientId, query = {}) => {
  const page = query.page ? Number(query.page) : 1;
  const limit = query.limit ? Number(query.limit) : 10;

  const match = { patientId, isDeleted: false };
  if (query.status) match.status = query.status;
  if (query.kind) match.kind = query.kind;

  const pipeline = [{ $match: match }, { $sort: { createdAt: -1 } }];

  return pagination(PatientSubscription, pipeline, page, limit);
};
