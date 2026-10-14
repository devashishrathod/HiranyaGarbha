const SubscriptionPayment = require("../../models/SubscriptionPayment");
const { PAYMENT_ATTEMPT_STATUS } = require("../../constants");
const { bucketKey, fillSeries } = require("../../helpers/dashboard");

/*
 * When the money landed. The webhook stamps `receivedAt` at capture; the
 * attempt's own `createdAt` is when the checkout was opened, which can be
 * minutes or (for a retried UPI) days earlier.
 */
const PAID_AT = { $ifNull: ["$receivedAt", "$createdAt"] };

const capturedBetween = (start, end) => [
  { $match: { status: PAYMENT_ATTEMPT_STATUS.CAPTURED } },
  { $addFields: { paidAt: PAID_AT } },
  { $match: { paidAt: { $gte: start, $lte: end } } },
];

/**
 * Captured subscription revenue for the window, per bucket, plus the previous
 * window's total for the change chip.
 *
 * ⚠️ Net of refunds by construction: a refund flips the payment row to
 * REFUNDED, so it drops out of every window, including the one it was paid in.
 */
exports.getRevenue = async (range) => {
  const [rows, [previous]] = await Promise.all([
    SubscriptionPayment.aggregate([
      ...capturedBetween(range.start, range.end),
      {
        $group: {
          _id: bucketKey("$paidAt", range.bucket),
          amount: { $sum: "$amount" },
          payments: { $sum: 1 },
        },
      },
    ]),
    SubscriptionPayment.aggregate([
      ...capturedBetween(range.previous.start, range.previous.end),
      { $group: { _id: null, amount: { $sum: "$amount" } } },
    ]),
  ]);

  const series = fillSeries(range, rows, { amount: 0, payments: 0 });

  return {
    total: series.reduce((sum, point) => sum + point.amount, 0),
    payments: series.reduce((sum, point) => sum + point.payments, 0),
    previousTotal: previous?.amount || 0,
    series,
  };
};
