const formatGrammer = (text = "") => {
  if (!text || typeof text !== "string") return "";

  return text
    .toLowerCase()
    .replace(/(^\s*[a-z])|([.!?]\s*[a-z])/g, (match) => match.toUpperCase());
};

export default formatGrammer;
