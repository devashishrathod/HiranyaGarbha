import {
  isValidVideoLink,
  toModuleList,
  withScheme,
} from "../../constants/subscription";
import { extractYoutubeId } from "../../utils/youtube";

const DIRECT_VIDEO = /\.(mp4|webm|ogg|ogv|mov|m4v)$/i;

const parseLink = (link) => {
  try {
    return new URL(withScheme(link.trim()));
  } catch {
    return null;
  }
};

/* "youtube.com", "vimeo.com" — enough to tell where a link goes */
export const videoHost = (link) =>
  parseLink(link)?.hostname.replace(/^www\./, "") || "";

/* YouTube and plain video files play in the panel; anything else opens */
export const playsInline = (link) => {
  if (extractYoutubeId(link)) return true;
  const url = parseLink(link);
  return Boolean(url && DIRECT_VIDEO.test(url.pathname));
};

/* Rows carry a key of their own so React keeps each one's inputs (and focus)
   in place while rows are moved or removed. */
let rowCount = 0;
export const moduleRow = (module = {}) => ({
  key: `module-${(rowCount += 1)}`,
  title: module.title || "",
  description: module.description || "",
  videoUrl: module.videoUrl || "",
});

export const toModuleRows = (modules) => toModuleList(modules).map(moduleRow);

/**
 * Rows to the API shape. Fully blank rows are dropped; a row with a
 * description or video but no title is an error, not silently lost.
 *
 * @returns {{ modules: Array } | { error: string }}
 */
export const fromModuleRows = (rows) => {
  const modules = [];

  for (const [index, row] of rows.entries()) {
    const title = row.title.trim();
    const description = row.description.trim();
    const videoUrl = row.videoUrl.trim();

    if (!title && !description && !videoUrl) continue;
    if (!title) return { error: `Module ${index + 1} needs a title` };
    if (videoUrl && !isValidVideoLink(videoUrl))
      return { error: `Module ${index + 1}: the video link is not valid` };

    modules.push({
      title,
      description,
      videoUrl: videoUrl ? withScheme(videoUrl) : "",
    });
  }

  return { modules };
};
