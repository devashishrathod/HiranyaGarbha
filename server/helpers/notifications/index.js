const { notify } = require("./notify");
const { notifyAudience } = require("./notifyAudience");
const { resolveAudience, AUDIENCE_BY_ROLE } = require("./resolveAudience");
const { renderTemplate, recipientValues } = require("./renderTemplate");
const { sendQuietly } = require("./sendQuietly");
const { notifySubscriptionActivated } = require("./subscriptionNotices");

/**
 * The notification layer's public surface.
 *
 * Domain code imports from here and nowhere deeper. Reaching past this barrel
 * into `../push` or `../nodeMailer` is how a second delivery path starts —
 * which is the duplication this module exists to prevent.
 *
 * Phase 2 (appointment notices, see docs/NOTIFICATIONS.md §10) adds sibling
 * files here that are thin wrappers over `notify`, exported from this same
 * barrel. Phase 3 has started: `subscriptionNotices` is below.
 */
module.exports = {
  // One recipient. What every domain event uses.
  notify,
  // Many recipients. What the admin broadcast uses.
  notifyAudience,
  // Declarative audience -> concrete people. Shared by the send path and the
  // panel's live recipient count, so the preview cannot disagree with reality.
  resolveAudience,
  AUDIENCE_BY_ROLE,
  // Merge tags.
  renderTemplate,
  recipientValues,
  // Wrap a notice so a delivery failure cannot unwind the operation.
  sendQuietly,
  // Subscription notices (phase 3). The rest of the set lands with the
  // lifecycle and job phases in docs/SUBSCRIPTIONS.md §10.
  notifySubscriptionActivated,
};
