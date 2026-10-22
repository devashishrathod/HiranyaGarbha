/* Mirrors server/constants.js -> MAX_UPLOAD_BYTES. The server checks again. */

export const UPLOAD_LIMIT = {
  MAX_BYTES: 100 * 1024 * 1024,
  LABEL: "100 MB",
  HINT: "Up to 100 MB",
};
