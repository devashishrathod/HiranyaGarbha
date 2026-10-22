/**
 * Splits text into plain and link parts, for turning pasted URLs such as
 * YouTube links into anchors. Only http(s):// and www. links are matched, so
 * every href produced is http(s) — never javascript: or data:.
 */

// Not inside a word or an email address; ends where a pasted URL can't go on.
const URL_PATTERN = /(?<![\w@.])(?:https?:\/\/|www\.)[^\s<>"'`]+/gi;

// What a sentence puts right after a link: "watch https://youtu.be/x."
const TRAILING_PUNCTUATION = /[.,;:!?]+$/;

const LINK_START = /^(?:https?:\/\/|www\.)\S/i;

const count = (text, char) => text.split(char).length - 1;

const trimUrl = (raw) => {
  let url = raw.replace(TRAILING_PUNCTUATION, "");
  // Keep the ")" of .../wiki/Foo_(bar) but drop the one closing "(see https://x.com)".
  while (url.endsWith(")") && count(url, "(") < count(url, ")")) {
    url = url.slice(0, -1).replace(TRAILING_PUNCTUATION, "");
  }
  return url;
};

/** @returns {{ text: string, href?: string }[]} */
export const splitLinks = (text = "") => {
  const parts = [];
  let last = 0;

  for (const match of text.matchAll(URL_PATTERN)) {
    const url = trimUrl(match[0]);
    if (!LINK_START.test(url)) continue;

    if (match.index > last) parts.push({ text: text.slice(last, match.index) });
    parts.push({
      text: url,
      href: /^www\./i.test(url) ? `https://${url}` : url,
    });
    last = match.index + url.length;
  }

  if (last < text.length) parts.push({ text: text.slice(last) });
  return parts;
};
