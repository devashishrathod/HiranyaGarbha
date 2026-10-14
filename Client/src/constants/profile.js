/* Mirrors server/constants.js -> PROFILE_IMAGE. The server checks again. */

export const PROFILE_PHOTO = {
  MAX_BYTES: 5 * 1024 * 1024,
  MIME_TYPES: ["image/jpeg", "image/png", "image/webp"],
  ACCEPT: "image/jpeg,image/png,image/webp",
  HINT: "JPG, PNG or WebP, up to 5 MB",
};
