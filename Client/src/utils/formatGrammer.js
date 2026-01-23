/**
 * Formats text for UI display:
 * - Trims extra spaces
 * - Capitalizes first letter
 * - Capitalizes first letter after . ! ?
 * - Keeps line breaks intact
 */
const formatGrammer = (text = "") => {
  if (!text || typeof text !== "string") return "";

  return (
    text
      .trim()
      // normalize spaces
      .replace(/\s+/g, " ")
      // capitalize first character
      .replace(/^([a-z])/, (match) => match.toUpperCase())
      // capitalize after sentence endings
      .replace(/([.!?]\s+)([a-z])/g, (_, p1, p2) => {
        return p1 + p2.toUpperCase();
      })
  );
};

export default formatGrammer;
