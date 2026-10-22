/*
 * A course module is { title, description?, videoUrl? }. Modules used to be
 * plain strings, and old records, the seed script and older clients can still
 * hand one over, so every write and every lean read goes through
 * `normalizeModules` and comes out in the object shape.
 *
 * Mirrored in Client/src/constants/subscription.js.
 */

const MODULE_TITLE_MAX = 200;
const MODULE_DESCRIPTION_MAX = 300;
const MODULE_VIDEO_URL_MAX = 500;
const MODULES_MAX = 60;

const HAS_SCHEME = /^https?:\/\//i;

const toText = (value) => (typeof value === "string" ? value.trim() : "");

// "youtu.be/..." pasted without a scheme is stored with https:// so every
// "Watch video" link is absolute.
const withScheme = (link) => (HAS_SCHEME.test(link) ? link : `https://${link}`);

/** Any http(s) link with a real host: YouTube plays inline, the rest open. */
const isValidVideoLink = (link) => {
  const raw = toText(link);
  if (!raw) return false;

  try {
    const url = new URL(withScheme(raw));
    return /^https?:$/.test(url.protocol) && url.hostname.includes(".");
  } catch {
    return false;
  }
};

const normalizeModule = (item) => {
  if (typeof item === "string") {
    const title = item.trim();
    return title ? { title } : null;
  }
  if (!item || typeof item !== "object") return null;

  const title = toText(item.title);
  if (!title) return null;

  const module = { title };
  const description = toText(item.description);
  const videoUrl = toText(item.videoUrl);
  if (description) module.description = description;
  if (videoUrl) module.videoUrl = withScheme(videoUrl);
  return module;
};

// Anything that is not an array is passed through, so `undefined` on an
// update still means "leave the modules alone".
const normalizeModules = (list) =>
  Array.isArray(list) ? list.map(normalizeModule).filter(Boolean) : list;

module.exports = {
  MODULE_TITLE_MAX,
  MODULE_DESCRIPTION_MAX,
  MODULE_VIDEO_URL_MAX,
  MODULES_MAX,
  isValidVideoLink,
  normalizeModules,
};
