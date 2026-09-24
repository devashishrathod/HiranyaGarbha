const mongoose = require("mongoose");
const {
  PAYMENT_ATTEMPT_STATUS,
  PAYMENT_PURPOSE,
} = require("../constants");

const refundSchema = new mongoose.Schema(
  {
    refundId: { type: String, trim: true },
    amount: { type: Number, min: 0 },
    reason: { type: String, trim: true },
    at: { type: Date },
  },
  { _id: false }
);

/*
 * One row per payment attempt, append-only.
 *
 * Kept separate from PatientSubscription because the two have different
 * lifetimes: one subscription can carry several attempts — a card that failed,
 * then a UPI that worked. Folding them into the subscription would either lose
 * the failures or turn the document into an unbounded log.
 */
const subscriptionPaymentSchema = new mongoose.Schema(
  {
    patientSubscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PatientSubscription",
      required: true,
      index: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      index: true,
    },

    provider: { type: String, default: "razorpay" },
    orderId: { type: String, trim: true, index: true },
    /*
     * ⚠️ The idempotency key of the whole integration.
     *
     * Razorpay redelivers a webhook until it gets a 200, so `payment.captured`
     * arrives more than once as a matter of course. The unique index makes the
     * second insert fail with E11000, which the handler catches and answers
     * 200 — no replay logic anywhere else in the system.
     */
    paymentId: { type: String, trim: true },
    signature: { type: String, trim: true },

    // Rupees, like Subscription.price. Paise conversion happens only at the
    // Razorpay edge, never in the database.
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "INR" },

    status: {
      type: String,
      enum: Object.values(PAYMENT_ATTEMPT_STATUS),
      default: PAYMENT_ATTEMPT_STATUS.CREATED,
      index: true,
    },
    method: { type: String, trim: true }, // card / upi / netbanking, as reported
    purpose: {
      type: String,
      enum: Object.values(PAYMENT_PURPOSE),
      default: PAYMENT_PURPOSE.NEW,
    },

    failureReason: { type: String, trim: true },
    refund: { type: refundSchema, default: undefined },

    // The webhook body as received. Kept verbatim for chargebacks and for
    // working out what happened when a reconciliation disagrees.
    rawEvent: { type: mongoose.Schema.Types.Mixed },
    receivedAt: { type: Date },
  },
  { timestamps: true, versionKey: false }
);

subscriptionPaymentSchema.index({ paymentId: 1 }, { unique: true, sparse: true });
subscriptionPaymentSchema.index({ patientSubscriptionId: 1, createdAt: -1 });

module.exports = mongoose.model(
  "SubscriptionPayment",
  subscriptionPaymentSchema
);
