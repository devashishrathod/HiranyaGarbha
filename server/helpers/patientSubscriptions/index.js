const period = require("./period");
const pricing = require("./pricing");
const transitions = require("./transitions");
const { nextSubscriptionNumber } = require("./subscriptionNumber");

/**
 * Pure subscription arithmetic. No database, no gateway.
 *
 * Services and the preview endpoint both import from here, which is what keeps
 * the price a patient is quoted identical to the one they are charged.
 */
module.exports = {
  ...period,
  ...pricing,
  ...transitions,
  nextSubscriptionNumber,
};
