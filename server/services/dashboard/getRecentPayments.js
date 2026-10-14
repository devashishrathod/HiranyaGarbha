const SubscriptionPayment = require("../../models/SubscriptionPayment");

const DEFAULT_LIMIT = 8;

/** Shape one populated payment row for the dashboard tables and feed. */
const toPaymentView = (row) => ({
  id: row._id,
  status: row.status,
  amount: row.amount,
  method: row.method || null,
  failureReason: row.failureReason || null,
  at: row.refund?.at || row.receivedAt || row.updatedAt || row.createdAt,
  subscriptionNumber: row.patientSubscriptionId?.subscriptionNumber || null,
  tier: row.patientSubscriptionId?.tier || null,
  trimester: row.patientSubscriptionId?.trimester || null,
  planName: row.patientSubscriptionId?.snapshot?.name || null,
  patient: row.patientId
    ? { name: row.patientId.fullName, userId: row.patientId.userId }
    : null,
});

const findPayments = (filter, sort, limit) =>
  SubscriptionPayment.find(filter)
    .sort(sort)
    .limit(limit)
    .select("-rawEvent -signature")
    .populate("patientId", "fullName userId")
    .populate("patientSubscriptionId", "subscriptionNumber tier trimester snapshot.name")
    .lean();

/**
 * The latest checkout attempts, newest first — including ones still waiting
 * for payment, so an admin can see a checkout that never completed.
 */
exports.getRecentPayments = async (limit = DEFAULT_LIMIT) => {
  const rows = await findPayments({}, { createdAt: -1 }, limit);
  return rows.map(toPaymentView);
};

exports.findPayments = findPayments;
exports.toPaymentView = toPaymentView;
