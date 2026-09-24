const Razorpay = require("razorpay");
require("dotenv").config();

/*
 * Built on first use, not at require time.
 *
 * ⚠️ The SDK throws from its constructor when `key_id` is missing. Building it
 * eagerly would take the whole server down on boot just because payment keys
 * are not configured yet — appointments, patients and the rest have nothing to
 * do with Razorpay and must keep serving.
 *
 * So: boot always succeeds, and a checkout attempted without keys fails with a
 * clear 503 instead of a stack trace at startup.
 */
let instance = null;

const isConfigured = () =>
  Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_SECRET);

const getRazorpay = () => {
  if (instance) return instance;

  if (!isConfigured()) {
    const error = new Error(
      "Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_SECRET - see docs/SUBSCRIPTIONS.md section 12."
    );
    error.statusCode = 503;
    throw error;
  }

  instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET,
  });

  return instance;
};

module.exports = { getRazorpay, isConfigured };
