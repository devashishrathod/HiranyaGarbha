const { listSubscriptions } = require("./listSubscriptions");
const { getSubscriptionStats } = require("./getSubscriptionStats");
const { getSubscriptionDetail } = require("./getSubscriptionDetail");

/**
 * Admin, read-only: the plan history behind the panel's "Patient plans" page.
 * Grant, adjust, cancel and refund are still to come (docs/SUBSCRIPTIONS.md,
 * Phase 3).
 */
module.exports = { listSubscriptions, getSubscriptionStats, getSubscriptionDetail };
