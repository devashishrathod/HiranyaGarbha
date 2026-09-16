/**
 * Reference fields come back either populated (an object) or as a raw id string
 * depending on which endpoint served them, so read them through these helpers.
 */

export const idOf = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value._id ? String(value._id) : "";
};

export const nameOf = (value, fallback = "—") => {
  if (!value || typeof value === "string") return fallback;
  return value.fullName || value.name || fallback;
};

export const buildQuery = (params = {}) => {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    search.set(key, String(value));
  });

  const query = search.toString();
  return query ? `?${query}` : "";
};

export const withPath = (template, values = {}) =>
  Object.entries(values).reduce(
    (path, [key, value]) => path.replace(`:${key}`, encodeURIComponent(value)),
    template,
  );
