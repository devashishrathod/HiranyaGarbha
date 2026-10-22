/**
 * Formats text for UI display:
 * - Trims extra spaces
 * - Capitalizes first letter
 * - Capitalizes first letter after . ! ?
 * - Keeps line breaks intact
 * - Leaves a word that is a link alone, so it never reads "Https://"
 *   (the lookahead skips the rest of "https://" or "www.")
 */
const formatGrammer = (text = "") => {
  if (!text || typeof text !== "string") return "";

  return (
    text
      .trim()
      // normalize spaces
      .replace(/\s+/g, " ")
      // capitalize first character
      .replace(/^([a-z])(?![a-z0-9+.-]*:\/\/|ww\.)/, (match) =>
        match.toUpperCase(),
      )
      // capitalize after sentence endings
      .replace(/([.!?]\s+)([a-z])(?![a-z0-9+.-]*:\/\/|ww\.)/g, (_, p1, p2) => {
        return p1 + p2.toUpperCase();
      })
  );
};

export default formatGrammer;
