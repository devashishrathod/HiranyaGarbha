const mongoose = require("mongoose");
const PatientSubscription = require("../../../models/PatientSubscription");
const SubscriptionPayment = require("../../../models/SubscriptionPayment");
const { throwError } = require("../../../utils");
const { stateExpression } = require("./filters");

/**
 * One plan with everything an admin needs to answer "what happened here":
 * the patient, the plan as sold, the billing breakdown, the plans it replaced
 * or renewed, and every payment attempt against it.
 */
exports.getSubscriptionDetail = async (id, now = new Date()) => {
  const _id = new mongoose.Types.ObjectId(id);

  const [row] = await PatientSubscription.aggregate([
    { $match: { _id, isDeleted: false } },
    { $addFields: { state: stateExpression(now) } },
  ]);
  if (!row) throwError(404, "Plan not found");

  const [subscription, payments] = await Promise.all([
    PatientSubscription.populate(row, [
      {
        path: "patientId",
        select: "fullName phone email userId image currentTrimester edd",
      },
      { path: "packageId", select: "name tier isActive" },
      { path: "createdBy", select: "name email role" },
      { path: "previousSubscriptionId", select: "subscriptionNumber tier snapshot.name" },
      { path: "renewedFromId", select: "subscriptionNumber tier snapshot.name" },
    ]),
    SubscriptionPayment.find({ patientSubscriptionId: _id })
      .sort({ createdAt: -1 })
      .select("-rawEvent -signature")
      .lean(),
  ]);

  const { patientId, packageId, createdBy, gateway, ...rest } = subscription;

  return {
    ...rest,
    patient: patientId || null,
    package: packageId || null,
    createdBy: createdBy || null,
    // The order and payment ids help when reconciling with Razorpay;
    // the signature is never sent back.
    gateway: gateway ? { provider: gateway.provider, orderId: gateway.orderId, paymentId: gateway.paymentId } : null,
    payments,
  };
};
