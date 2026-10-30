import { useState } from "react";
import { Check, CirclePlay, ExternalLink } from "lucide-react";

import YouTubePlayer from "../UI/YouTubePlayer";
import { toModuleList, withScheme } from "../../constants/subscription";
import { extractYoutubeId } from "../../utils/youtube";
import { playsInline, videoHost } from "./moduleRows";

const VideoLink = ({ href, label = "Open video" }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
  >
    <ExternalLink size={13} aria-hidden="true" />
    {label}
    <span className="font-normal text-gray-400">· {videoHost(href)}</span>
  </a>
);

export const ModuleVideo = ({ url, title }) => {
  const youtubeId = extractYoutubeId(url);
  if (youtubeId) return <YouTubePlayer videoId={youtubeId} title={title} />;

  const href = withScheme(url.trim());
  if (playsInline(href)) {
    return (
      <video
        src={href}
        controls
        preload="metadata"
        className="aspect-video w-full rounded-lg bg-black"
      />
    );
  }

  return <VideoLink href={href} />;
};

/*
 * Opens while the pointer is over (or keyboard focus is inside) the nearest
 * `group/module`. Keyboard focus only: a click also focuses the row, and
 * that card would stay open next to the one under the pointer. It hangs
 * below its positioned parent; pt-1.5 instead of a margin keeps the pointer
 * inside the hover area on its way down to it.
 */
const HoverCard = ({ children }) => (
  <div
    role="tooltip"
    className="invisible absolute inset-x-0 top-full z-20 pt-1.5 opacity-0 transition-opacity group-focus-visible/module:visible group-focus-visible/module:opacity-100 group-has-[:focus-visible]/module:visible group-has-[:focus-visible]/module:opacity-100 group-hover/module:visible group-hover/module:opacity-100"
  >
    <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-lg">
      {children}
    </div>
  </div>
);

const Description = ({ text }) => (
  <p className="whitespace-pre-line break-words text-xs leading-relaxed text-gray-600">
    {text}
  </p>
);

// Dotted underline: this title has a description to hover for
const hintClass =
  "cursor-help underline decoration-gray-300 decoration-dotted underline-offset-4";

const focusRing =
  "rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500";

const videoButtonClass =
  "inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-white px-2.5 py-1.5 text-xs font-semibold text-blue-600 ring-1 ring-gray-200 transition-colors hover:bg-blue-50";

/**
 * The full module list. Each module reads as a plain numbered point; its
 * description shows on hover, and a module with a video gets a button that
 * plays it in place. One player is open at a time.
 */
export const CourseModuleList = ({ modules, columns = 1 }) => {
  const [openIndex, setOpenIndex] = useState(null);
  const items = toModuleList(modules);

  if (!items.length) return <span className="text-sm text-gray-500">-</span>;

  return (
    <ol
      className={`grid grid-cols-1 items-start gap-2 ${
        columns === 2 ? "md:grid-cols-2" : ""
      }`}
    >
      {items.map((module, index) => {
        const isOpen = openIndex === index;
        const videoHref = module.videoUrl ? withScheme(module.videoUrl.trim()) : "";

        return (
          <li key={index} className="rounded-xl bg-gray-50 p-3">
            <div className="relative flex items-center gap-3">
              <div
                tabIndex={module.description ? 0 : undefined}
                className={`group/module flex min-w-0 flex-1 items-center gap-3 ${focusRing}`}
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-xs font-semibold text-white">
                  {index + 1}
                </span>
                <span
                  className={`min-w-0 break-words text-sm text-gray-700 ${
                    module.description ? `${hintClass} hover:text-gray-900` : ""
                  }`}
                >
                  {module.title}
                </span>
                {module.description ? (
                  <HoverCard>
                    <Description text={module.description} />
                  </HoverCard>
                ) : null}
              </div>

              {!videoHref ? null : playsInline(videoHref) ? (
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  className={videoButtonClass}
                >
                  <CirclePlay size={14} aria-hidden="true" />
                  {isOpen ? "Hide video" : "Watch video"}
                </button>
              ) : (
                <a
                  href={videoHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={videoHost(videoHref)}
                  className={videoButtonClass}
                >
                  <ExternalLink size={13} aria-hidden="true" />
                  Watch video
                </a>
              )}
            </div>

            {isOpen ? (
              <div className="mt-3">
                <ModuleVideo url={videoHref} title={module.title} />
              </div>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
};

/**
 * Short list for a package card. Hovering (or tabbing to) a module that has
 * details opens a small card with its description and video link.
 */
export const ModuleHoverList = ({ modules, limit, moreLabel = "modules" }) => {
  const items = toModuleList(modules);

  return (
    <ul className="space-y-1.5">
      {items.slice(0, limit).map((module, index) => {
        const hasDetails = Boolean(module.description || module.videoUrl);

        return (
          <li key={index} className="group/module relative">
            <div
              tabIndex={hasDetails ? 0 : undefined}
              className={`flex items-start gap-2 text-sm text-gray-600 ${focusRing}`}
            >
              <Check size={15} className="mt-0.5 shrink-0 text-emerald-500" aria-hidden="true" />
              <span
                className={
                  hasDetails ? `${hintClass} group-hover/module:text-gray-900` : ""
                }
              >
                {module.title}
              </span>
              {module.videoUrl ? (
                <CirclePlay size={14} className="mt-0.5 shrink-0 text-blue-500" aria-label="Has a video" />
              ) : null}
            </div>

            {hasDetails ? (
              <HoverCard>
                <p className="mb-1 text-sm font-semibold text-gray-900">{module.title}</p>
                {module.description ? <Description text={module.description} /> : null}
                {module.videoUrl ? (
                  <div className="mt-2">
                    <VideoLink href={withScheme(module.videoUrl.trim())} label="Watch video" />
                  </div>
                ) : null}
              </HoverCard>
            ) : null}
          </li>
        );
      })}
      {items.length > limit ? (
        <li className="pl-[23px] text-xs font-medium text-gray-500">
          +{items.length - limit} more {moreLabel}
        </li>
      ) : null}
    </ul>
  );
};
