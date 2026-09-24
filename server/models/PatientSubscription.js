const mongoose = require("mongoose");
const {
  SUBSCRIPTION_TIERS,
  PLAN_TRIMESTERS,
  SUBSCRIPTION_STATUS,
  SUBSCRIPTION_PAYMENT_STATUS,
  SUBSCRIPTION_SOURCE,
  SUBSCRIPTION_KIND,
} = require("../constants");

/*
 * What the patient actually bought, copied at purchase time.
 *
 * ⚠️ A copy, not a live lookup. Prices and module lists change; a patient who
 * paid ₹9,999 in July must keep seeing ₹9,999 and the plan as it was sold even
 * after an admin edits the Pro package in September. `packageId` stays on the
 * parent for grouping and reporting.
 */
const snapshotSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    subtitle: { type: String, trim: true },
    price: { type: Number, min: 0 },
    originalPrice: { type: Number, min: 0 },
    durationInDays: { type: Number, min: 0 },
    modules: { type: [String], default: [] },
    includes: { type: [String], default: [] },
  },
  { _id: false }
);

/* What an upgrade carried over from the plan it replaced. */
const prorationSchema = new mongoose.Schema(
  {
    creditFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PatientSubscription",
    },
    creditAmount: { type: Number, default: 0, min: 0 },
    daysRemaining: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

/*
 * Gateway fields stay nested rather than flattened onto the root so that a
 * recurring mandate (`gateway.subscriptionId`) can be added later without
 * touching any other field.
 */
const gatewaySchema = new mongoose.Schema(
  {
    provider: { type: String, default: "razorpay" },
    orderId: { type: String, trim: true },
    paymentId: { type: String, trim: true },
    signature: { type: String, trim: true },
  },
  { _id: false }
);

const reminderSchema = new mongoose.Schema(
  { daysBefore: { type: Number }, at: { type: Date } },
  { _id: false }
);

const patientSubscriptionSchema = new mongoose.Schema(
  {
    subscriptionNumber: { type: String, unique: true, index: true },

    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      index: true,
    },
    // Denormalised: every entitlement check starts from a JWT, and carrying the
    // user id here keeps a Patient lookup off the hottest path in the app.
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    packageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
      required: true,
    },
    kind: {
      type: String,
      enum: Object.values(SUBSCRIPTION_KIND),
      default: SUBSCRIPTION_KIND.PACKAGE,
    },
    tier: {
      type: String,
      enum: Object.values(SUBSCRIPTION_TIERS),
      required: true,
    },
    trimester: {
      type: String,
      enum: Object.values(PLAN_TRIMESTERS),
      required: true,
    },
    snapshot: { type: snapshotSchema, required: true },

    startDate: { type: Date },
    endDate: { type: Date },
    graceUntil: { type: Date },

    status: {
      type: String,
      enum: Object.values(SUBSCRIPTION_STATUS),
      default: SUBSCRIPTION_STATUS.PENDING_PAYMENT,
      index: true,
    },

    currency: { type: String, default: "INR" },
    listPrice: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 }, // reserved for coupons
    proration: { type: prorationSchema, default: () => ({}) },
    amountPayable: { type: Number, required: true, min: 0 },
    amountPaid: { type: Number, default: 0, min: 0 },
    paymentStatus: {
      type: String,
      enum: Object.values(SUBSCRIPTION_PAYMENT_STATUS),
      default: SUBSCRIPTION_PAYMENT_STATUS.PENDING,
    },

    gateway: { type: gatewaySchema, default: () => ({}) },

    previousSubscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PatientSubscription",
    },
    renewedFromId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PatientSubscription",
    },

    source: {
      type: String,
      enum: Object.values(SUBSCRIPTION_SOURCE),
      default: SUBSCRIPTION_SOURCE.PATIENT,
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    grantReason: { type: String, trim: true },

    cancelledBy: { type: String, enum: ["PATIENT", "ADMIN", "SYSTEM", null] },
    cancelledAt: { type: Date },
    cancelReason: { type: String, trim: true },

    remindersSent: { type: [reminderSchema], default: [] },
    notes: { type: String, trim: true },

    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false }
);

patientSubscriptionSchema.index({ patientId: 1, status: 1, endDate: -1 });
patientSubscriptionSchema.index({ status: 1, endDate: 1 });
patientSubscriptionSchema.index({ packageId: 1, status: 1 });
patientSubscriptionSchema.index(
  { "gateway.orderId": 1 },
  { unique: true, sparse: true }
);

/*
 * One live package per patient, enforced by the database rather than by a
 * check-then-write in the service. Two upgrades racing each other cannot both
 * win. Bonus courses are deliberately outside the filter — they stack.
 */
patientSubscriptionSchema.index(
  { patientId: 1, kind: 1 },
  {
    unique: true,
    partialFilterExpression: {
      kind: SUBSCRIPTION_KIND.PACKAGE,
      status: SUBSCRIPTION_STATUS.ACTIVE,
    },
  }
);

module.exports = mongoose.model(
  "PatientSubscription",
  patientSubscriptionSchema
);
