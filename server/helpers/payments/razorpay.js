const crypto = require("crypto");
const { getRazorpay, isConfigured } = require("../../configs/razorpay");
const { throwError } = require("../../utils");

/**
 * The only file in the codebase that talks to the Razorpay SDK.
 *
 * Services ask for an order and hand over a webhook body; they never see
 * `razorpay.orders.create`, an HMAC, or the word "paise". If the gateway is
 * swapped, or recurring mandates are added later, this file changes and
 * nothing above it does.
 *
 * Same boundary as `helpers/push/` in docs/NOTIFICATIONS.md §2.
 */

/**
 * Compare two hex digests without leaking where they differ.
 *
 * `timingSafeEqual` throws on a length mismatch, which a forged header can
 * trivially cause, so the length is checked first and a mismatch is a plain
 * false rather than a 500.
 */
const safeCompare = (a = "", b = "") => {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
};

/**
 * Create an order for an amount already computed in **rupees**.
 *
 * The x100 lives here and in nothing else, so a number read anywhere else in
 * the system is always rupees.
 */
const createOrder = async ({ amount, receipt, notes = {} }) => {
  let order;

  try {
    order = await getRazorpay().orders.create({
      amount: Math.round(Number(amount) * 100),
      currency: "INR",
      receipt,
      notes,
    });
  } catch (error) {
    /*
     * The SDK rejects with its own shape, not an Error, so an unwrapped
     * failure reaches the error handler as a bare 500 with nothing a caller
     * can act on. Bad credentials in particular are a deployment problem and
     * should say so in the log rather than reading as "the server broke".
     */
    const description =
      error?.error?.description || error?.message || "unknown error";
    console.error(`[razorpay] order creation failed: ${description}`);

    // throwError, not a bare Error: the handler only reads statusCode off a
    // CustomError, so anything else still surfaces as a 500.
    if (error?.statusCode === 401)
      throwError(
        503,
        "Payment gateway credentials are invalid. Please contact support."
      );

    throwError(502, `Payment gateway could not create the order: ${description}`);
  }

  return {
    orderId: order.id,
    amount: order.amount, // paise, as the checkout script expects
    currency: order.currency,
    status: order.status,
  };
};

/**
 * Verify the signature the browser gets back from checkout.
 *
 * Proves the payment belongs to our order, but says nothing about capture —
 * that is what the webhook is for. See docs/SUBSCRIPTIONS.md §6 step 3.
 */
const verifyPaymentSignature = ({ orderId, paymentId, signature }) => {
  if (!orderId || !paymentId || !signature) return false;

  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return safeCompare(expected, signature);
};

/**
 * Verify a webhook against the **raw** request body.
 *
 * ⚠️ `rawBody` must be the bytes Razorpay sent. Re-serialising a parsed object
 * produces different bytes (key order, whitespace) and the signature will
 * never match — which is why the webhook route is mounted before
 * `express.json()`.
 */
const verifyWebhookSignature = ({ rawBody, signature }) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !signature || !rawBody) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  return safeCompare(expected, signature);
};

const fetchPayment = async (paymentId) => getRazorpay().payments.fetch(paymentId);

/** `amount` in rupees; omit it to refund the whole payment. */
const refundPayment = async ({ paymentId, amount, notes = {} }) => {
  const payload = { notes };
  if (amount) payload.amount = Math.round(Number(amount) * 100);

  const refund = await getRazorpay().payments.refund(paymentId, payload);

  return {
    refundId: refund.id,
    amount: Number(refund.amount) / 100,
    status: refund.status,
  };
};

module.exports = {
  isConfigured,
  createOrder,
  verifyPaymentSignature,
  verifyWebhookSignature,
  fetchPayment,
  refundPayment,
};
