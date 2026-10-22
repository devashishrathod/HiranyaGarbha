/*
 * YouTube links the way admins paste them — watch pages, youtu.be shares,
 * Shorts, live streams and embeds, from desktop, mobile or YouTube Music.
 * Only the video id matters: every player and thumbnail URL is built from it.
 *
 * Mirrored in Client/src/utils/youtube.js so the form can check a link before
 * it is sent.
 */

const WATCH_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
]);
const SHORT_HOSTS = new Set(["youtu.be", "www.youtu.be"]);

// youtube.com/<prefix>/<id>
const ID_IN_PATH = new Set(["shorts", "live", "embed", "v"]);

const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;

/** @returns {string|null} the 11-character video id, or null for anything else */
const extractYoutubeId = (link) => {
  if (typeof link !== "string" || !link.trim()) return null;

  const raw = link.trim();
  let url;
  try {
    url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
  } catch {
    return null;
  }

  const host = url.hostname.toLowerCase();
  const [first, second] = url.pathname.split("/").filter(Boolean);
  let id = null;

  if (SHORT_HOSTS.has(host)) id = first;
  else if (WATCH_HOSTS.has(host)) {
    if (first === "watch") id = url.searchParams.get("v");
    else if (ID_IN_PATH.has(first)) id = second;
  }

  return id && VIDEO_ID.test(id) ? id : null;
};

const youtubeThumbnail = (id) => `https://img.youtube.com/vi/${id}/hqdefault.jpg`;

module.exports = { extractYoutubeId, youtubeThumbnail };
