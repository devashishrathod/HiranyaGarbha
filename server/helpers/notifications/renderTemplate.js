/**
 * Merge-tag substitution.
 *
 * The admin composer offers `{{name}}`, `{{firstName}}`, `{{trimester}}` and
 * `{{doctor}}`. Every one is resolved here, per recipient, before the
 * notification row is written — so the row stores the finished text and the
 * mobile app never has to know a template language.
 *
 * ⚠️ An unknown tag is left **as written** rather than blanked. A typo like
 * `{{naem}}` showing through in a preview is a bug an admin can see and fix;
 * an empty gap in the sentence is one nobody notices until it has gone out to
 * a thousand people.
 *
 * A *known* tag with no value for that person falls back to something readable
 * ("there", "your pregnancy") rather than leaving a hole mid-sentence.
 */
const FALLBACKS = Object.freeze({
  name: "there",
  firstName: "there",
  trimester: "your pregnancy",
  doctor: "your doctor",
});

/**
 * @param {string} text
 * @param {object} values  { name, firstName, trimester, doctor, ... }
 */
exports.renderTemplate = (text = "", values = {}) => {
  if (!text || !text.includes("{{")) return text;

  return text.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key) => {
    if (!(key in values) && !(key in FALLBACKS)) return match;

    const value = values[key];
    if (value === null || value === undefined || value === "") {
      return FALLBACKS[key] ?? match;
    }

    return String(value);
  });
};

/**
 * The substitution values for one recipient.
 *
 * Kept next to `renderTemplate` so the tags the composer advertises and the
 * values the sender can actually supply cannot drift apart.
 */
exports.recipientValues = (recipient = {}) => {
  const name = recipient.name || recipient.fullName || "";

  return {
    name,
    firstName: name.split(" ").filter(Boolean)[0] || "",
    trimester: recipient.currentTrimester || "",
    doctor: recipient.doctorName || "",
  };
};
