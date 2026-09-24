const { notify } = require("./notify");
const { notifyAudience } = require("./notifyAudience");
const { resolveAudience, AUDIENCE_BY_ROLE } = require("./resolveAudience");
const { renderTemplate, recipientValues } = require("./renderTemplate");
const { sendQuietly } = require("./sendQuietly");

/**
 * The notification layer's public surface.
 *
 * Domain code imports from here and nowhere deeper. Reaching past this barrel
 * into `../push` or `../nodeMailer` is how a second delivery path starts —
 * which is the duplication this module exists to prevent.
 *
 * Phase 2 and 3 (appointment and subscription notices, see
 * docs/NOTIFICATIONS.md §10) add sibling files here that are thin wrappers
 * over `notify`, and export them from this same barrel.
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
};
