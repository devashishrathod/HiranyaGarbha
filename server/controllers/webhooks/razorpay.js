const { asyncWrapper } = require("../../utils");
const { razorpay } = require("../../helpers/payments");
const { handleWebhookEvent } = require("../../services/patientSubscriptions");

/**
 * Razorpay webhook receiver.
 *
 * ⚠️ Unauthenticated by necessity — Razorpay has no token to present. The HMAC
 * over the raw body *is* the authentication, which is why this route is
 * mounted with `express.raw()` before `express.json()` ever sees it.
 *
 * ⚠️ Answers 200 to anything it has already applied or does not care about.
 * A non-200 puts the event into Razorpay's retry queue for 24 hours, so
 * returning an error for "I ignored this" would have us re-served the same
 * unwanted event hundreds of times.
 *
 * The only non-200 is a bad signature, which is a real rejection.
 */
exports.razorpayWebhook = asyncWrapper(async (req, res) => {
  const signature = req.headers["x-razorpay-signature"];
  // express.raw leaves a Buffer on req.body; the HMAC must see those bytes,
  // not a re-serialised object.
  const rawBody = Buffer.isBuffer(req.body) ? req.body : null;

  if (!rawBody || !razorpay.verifyWebhookSignature({ rawBody, signature })) {
    console.error("[razorpay] webhook rejected: bad signature");
    return res.status(400).json({ success: false, message: "Invalid signature" });
  }

  let event;
  try {
    event = JSON.parse(rawBody.toString("utf8"));
  } catch (error) {
    console.error("[razorpay] webhook body was not JSON:", error?.message);
    return res.status(400).json({ success: false, message: "Invalid payload" });
  }

  try {
    const result = await handleWebhookEvent(event);
    console.log(`[razorpay] ${event.event}: ${result.reason}`);
  } catch (error) {
    /*
     * Swallowed deliberately. A crash here would send a 500, Razorpay would
     * retry for a day, and every retry would hit the same bug. The event body
     * is in the log and the payment row carries `rawEvent`, so the failure is
     * recoverable by hand — which is better than an automated retry storm.
     */
    console.error(`[razorpay] handler failed for ${event?.event}:`, error?.message);
  }

  return res.status(200).json({ success: true });
});
