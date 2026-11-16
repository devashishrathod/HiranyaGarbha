import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ExternalLink, Eye, ImageOff, ImagePlus, RefreshCw, X } from "lucide-react";

import { PROFILE_PHOTO } from "../../constants/profile";
import { Pill } from "./kit";

const formatBytes = (bytes) => {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const problemWith = (file, rules) => {
  if (!rules.MIME_TYPES.includes(file.type)) return `This file type is not supported. Use ${rules.HINT}.`;
  if (file.size > rules.MAX_BYTES) {
    return `This image is ${formatBytes(file.size)}. The limit is ${formatBytes(rules.MAX_BYTES)}.`;
  }
  return "";
};

/**
 * Full-size viewer. Rendered into <body> so it sits above an open Modal, and
 * it swallows Escape in the capture phase so closing the viewer does not also
 * close the Modal underneath (which listens for Escape on document).
 */
export const ImageLightbox = ({ src, alt = "", externalUrl, onClose }) => {
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key !== "Escape") return;
      event.stopPropagation();
      onClose();
    };

    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [onClose]);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={alt || "Image preview"}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
    >
      <button
        type="button"
        aria-label="Close preview"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
      />

      <div className="relative flex max-h-full max-w-3xl flex-col items-center gap-3">
        <img
          src={src}
          alt={alt}
          className="max-h-[80vh] max-w-full rounded-xl bg-white object-contain shadow-2xl"
        />

        <div className="flex items-center gap-2">
          {externalUrl ? (
            <a
              href={externalUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 text-sm font-medium text-white hover:bg-white/20"
            >
              <ExternalLink size={15} /> Open original
            </a>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-100"
          >
            <X size={15} /> Close
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

/**
 * Picks an image without uploading it. The parent keeps the File and sends it
 * when the form is saved, so until then the photo is only a draft. `file` must
 * be one this component handed to `onChange` (or null), since the preview URL
 * is made at pick time.
 *
 * - Nothing picked, nothing saved: a drop zone.
 * - A saved photo: thumbnail with View and Change.
 * - A new pick: thumbnail with a "not uploaded yet" badge, View, Change and a
 *   cross that discards it (falling back to the saved photo, if any).
 *
 * Pass `progress` (0-100) while the parent is uploading to show it on the thumbnail.
 */
const ImageUpload = ({
  label,
  currentUrl,
  file,
  onChange,
  rules = PROFILE_PHOTO,
  progress = null,
  disabled = false,
  pendingNote = "Uploads when you save",
  className = "",
}) => {
  const inputRef = useRef(null);
  /*
   * { file, url } for the picked file. The object URL keeps the file in memory
   * until it is revoked, so it is revoked on replace, discard and unmount.
   */
  const [draft, setDraft] = useState(null);
  const draftRef = useRef(null);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [viewing, setViewing] = useState(false);
  const [brokenUrl, setBrokenUrl] = useState("");

  useEffect(
    () => () => {
      if (draftRef.current) URL.revokeObjectURL(draftRef.current.url);
    },
    [],
  );

  const replaceDraft = (next) => {
    if (draftRef.current) URL.revokeObjectURL(draftRef.current.url);
    draftRef.current = next;
    setDraft(next);
  };

  const uploading = progress !== null;
  const locked = disabled || uploading;
  const isDraft = Boolean(file);
  const draftUrl = file && draft?.file === file ? draft.url : "";
  const currentBroken = Boolean(currentUrl) && brokenUrl === currentUrl;
  const hasCurrent = Boolean(currentUrl) && !currentBroken;
  const shownUrl = isDraft ? draftUrl : hasCurrent ? currentUrl : "";

  const openPicker = () => {
    if (!locked) inputRef.current?.click();
  };

  const accept = (picked) => {
    if (!picked) return;
    const problem = problemWith(picked, rules);
    setError(problem);
    if (problem) return;
    replaceDraft({ file: picked, url: URL.createObjectURL(picked) });
    onChange(picked);
  };

  const discardDraft = () => {
    setError("");
    replaceDraft(null);
    onChange(null);
  };

  const dropHandlers = locked
    ? {}
    : {
        onDragOver: (event) => {
          event.preventDefault();
          setDragging(true);
        },
        onDragLeave: (event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setDragging(false);
        },
        onDrop: (event) => {
          event.preventDefault();
          setDragging(false);
          accept(event.dataTransfer.files?.[0]);
        },
      };

  return (
    <div className={className}>
      {label ? (
        <span className="mb-1.5 block text-xs font-medium text-gray-600">{label}</span>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        accept={rules.ACCEPT}
        className="hidden"
        onChange={(event) => {
          accept(event.target.files?.[0]);
          // Reset so picking the same file again after discarding still fires.
          event.target.value = "";
        }}
      />

      {shownUrl ? (
        <div
          {...dropHandlers}
          className={`flex flex-col gap-4 rounded-xl border p-3 transition-colors sm:flex-row sm:items-center ${
            dragging
              ? "border-blue-400 bg-blue-50"
              : isDraft
                ? "border-amber-300 bg-amber-50/40"
                : "border-gray-200 bg-white"
          }`}
        >
          <div className="relative h-28 w-28 shrink-0">
            <button
              type="button"
              onClick={() => setViewing(true)}
              aria-label="View photo"
              className="group block h-full w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-50"
            >
              <img
                src={shownUrl}
                alt={isDraft ? "New photo preview" : "Current photo"}
                onError={() => !isDraft && setBrokenUrl(currentUrl)}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
              <span className="absolute inset-0 hidden items-center justify-center rounded-xl bg-slate-900/40 text-white group-hover:flex">
                <Eye size={20} />
              </span>
            </button>

            {uploading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 rounded-xl bg-slate-900/60 px-3 text-white">
                <span className="text-sm font-semibold tabular-nums">{progress}%</span>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/30">
                  <div
                    className="h-full rounded-full bg-white transition-[width] duration-200"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ) : null}

            {isDraft && !locked ? (
              <button
                type="button"
                onClick={discardDraft}
                aria-label="Remove this photo"
                title={hasCurrent ? "Discard and keep the current photo" : "Remove this photo"}
                className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-md hover:bg-red-50 hover:text-red-600"
              >
                <X size={15} />
              </button>
            ) : null}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {uploading ? (
                <Pill tone="blue">Uploading…</Pill>
              ) : isDraft ? (
                <Pill tone="amber">New · not uploaded yet</Pill>
              ) : (
                <Pill tone="green">Current photo</Pill>
              )}
            </div>

            {isDraft ? (
              <>
                <p className="mt-2 truncate text-sm font-medium text-gray-800" title={file.name}>
                  {file.name}
                </p>
                <p className="mt-0.5 text-xs text-gray-500">
                  {formatBytes(file.size)} · {pendingNote}
                  {hasCurrent ? ", replacing the current photo" : ""}
                </p>
              </>
            ) : (
              <p className="mt-2 text-xs text-gray-500">
                Pick a new one to replace it. Nothing changes until you save.
              </p>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setViewing(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                <Eye size={14} /> View
              </button>
              <button
                type="button"
                onClick={openPicker}
                disabled={locked}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw size={14} /> {isDraft ? "Choose another" : "Change photo"}
              </button>
              {isDraft && !locked ? (
                <button
                  type="button"
                  onClick={discardDraft}
                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                >
                  <X size={14} /> {hasCurrent ? "Keep current photo" : "Remove"}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={openPicker}
          disabled={locked}
          {...dropHandlers}
          className={`flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-7 text-center transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
            dragging
              ? "border-blue-400 bg-blue-50"
              : "border-gray-300 bg-gray-50/60 hover:border-blue-300 hover:bg-blue-50/40"
          }`}
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-blue-600 shadow-sm ring-1 ring-gray-200">
            {currentUrl && currentBroken ? <ImageOff size={20} /> : <ImagePlus size={20} />}
          </span>
          <span className="text-sm font-medium text-gray-800">
            {currentUrl && currentBroken
              ? "The current photo could not be loaded. Choose a new one"
              : "Click to choose a photo, or drag it here"}
          </span>
          <span className="text-xs text-gray-500">{rules.HINT}</span>
        </button>
      )}

      {error ? <p className="mt-1.5 text-xs text-red-600">{error}</p> : null}

      {viewing && shownUrl ? (
        <ImageLightbox
          src={shownUrl}
          alt={isDraft ? "New photo preview" : "Current photo"}
          externalUrl={isDraft ? undefined : currentUrl}
          onClose={() => setViewing(false)}
        />
      ) : null}
    </div>
  );
};

export default ImageUpload;
