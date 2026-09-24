const express = require("express");
const router = express.Router();

const { razorpayWebhook } = require("../controllers/webhooks");

/*
 * ⚠️ `express.raw` on this route only.
 *
 * The Razorpay signature is an HMAC over the exact bytes that were sent.
 * `express.json()` consumes the stream and re-serialising the parsed object
 * produces different bytes — key order and whitespace both change — so the
 * signature would never match. This is the most common way the integration is
 * built wrong.
 *
 * Every other route keeps the parsed-JSON behaviour it has always had.
 */
router.post(
  "/razorpay",
  express.raw({ type: "application/json" }),
  razorpayWebhook
);

module.exports = { router, routePrefix: "/webhooks" };
