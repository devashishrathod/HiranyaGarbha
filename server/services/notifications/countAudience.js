const { resolveAudience } = require("../../helpers/notifications");

/**
 * How many people a declarative audience currently resolves to.
 *
 * ⚠️ This runs **the same `resolveAudience` the send runs**. That is the whole
 * point of the endpoint existing rather than the panel counting rows through
 * `/patients/get-all`: a preview built on different code is a number that can
 * disagree with what actually goes out, and the one place an admin trusts it is
 * the confirmation dialog.
 */
exports.countAudience = async (target) => {
  const audience = await resolveAudience(target, { countOnly: true });

  return {
    total: audience.total,
    label: audience.label,
    truncated: audience.truncated,
    cap: audience.cap,
    // CSV-only: addresses with no account (mailable, but no in-app row) and
    // numbers that reach nobody at all.
    externalEmails: audience.externalEmails?.length || 0,
    unmatched: audience.unmatched || 0,
  };
};
