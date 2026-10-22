/*
 * Mirrors server/helpers/youtube — keep the two in step. The form uses it to
 * check a pasted link and preview it before anything is sent.
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
const ID_IN_PATH = new Set(["shorts", "live", "embed", "v"]);
const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;

/** @returns {string|null} the 11-character video id, or null for anything else */
export const extractYoutubeId = (link) => {
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

/**
 * Player URL. Autoplay is muted — browsers only autoplay silent video — and
 * loops, which YouTube only honours when the video is also its own playlist.
 */
export const youtubeEmbedUrl = (id, { autoplay = false } = {}) => {
  const params = new URLSearchParams({ rel: "0", playsinline: "1" });
  if (autoplay) {
    params.set("autoplay", "1");
    params.set("mute", "1");
    params.set("loop", "1");
    params.set("playlist", id);
  }
  return `https://www.youtube-nocookie.com/embed/${id}?${params}`;
};

export const youtubeWatchUrl = (id) => `https://www.youtube.com/watch?v=${id}`;
