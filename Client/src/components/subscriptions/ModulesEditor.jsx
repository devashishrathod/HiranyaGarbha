import { useRef, useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";

import { ModuleVideo } from "./CourseModules";
import { moduleRow, videoHost } from "./moduleRows";
import {
  MODULES_MAX,
  MODULE_DESCRIPTION_MAX,
  MODULE_TITLE_MAX,
  MODULE_VIDEO_URL_MAX,
  isValidVideoLink,
} from "../../constants/subscription";
import { extractYoutubeId } from "../../utils/youtube";

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50";

const IconButton = ({ label, danger = false, ...rest }) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    className={`flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors disabled:cursor-not-allowed disabled:opacity-30 ${
      danger ? "hover:bg-red-50 hover:text-red-600" : "hover:bg-gray-100 hover:text-gray-800"
    }`}
    {...rest}
  />
);

const LinkHint = ({ link, previewOpen, onTogglePreview }) => {
  if (!link) {
    return <span className="text-gray-400">YouTube links play inside the panel</span>;
  }
  if (!isValidVideoLink(link)) {
    return <span className="text-red-600">This is not a valid link</span>;
  }

  return (
    <span className="text-gray-500">
      {extractYoutubeId(link) ? "YouTube video" : videoHost(link)} ·{" "}
      <button
        type="button"
        onClick={onTogglePreview}
        className="font-medium text-blue-600 hover:underline"
      >
        {previewOpen ? "Hide preview" : "Preview"}
      </button>
    </span>
  );
};

/**
 * Course modules as editable rows. Each has a title and, optionally, a short
 * description and a video link. Enter in a title adds the next row, so a list
 * can still be typed in one go.
 */
const ModulesEditor = ({ rows, onChange, disabled = false }) => {
  const [previewKey, setPreviewKey] = useState(null);
  // A row just added; its title input focuses itself once it mounts
  const focusKey = useRef(null);

  const atLimit = rows.length >= MODULES_MAX;

  const updateRow = (key, field, value) =>
    onChange(rows.map((row) => (row.key === key ? { ...row, [field]: value } : row)));

  const insertAfter = (index) => {
    if (atLimit) return;
    const row = moduleRow();
    const next = [...rows];
    next.splice(index + 1, 0, row);
    focusKey.current = row.key;
    onChange(next);
  };

  const removeRow = (key) => onChange(rows.filter((row) => row.key !== key));

  const moveRow = (index, step) => {
    const target = index + step;
    if (target < 0 || target >= rows.length) return;
    const next = [...rows];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {rows.length ? (
        rows.map((row, index) => {
          const link = row.videoUrl.trim();
          const showPreview = previewKey === row.key && isValidVideoLink(link);

          return (
            <div key={row.key} className="space-y-3 rounded-lg border border-gray-200 p-3">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-xs font-semibold text-white">
                  {index + 1}
                </span>
                <input
                  ref={(el) => {
                    if (el && focusKey.current === row.key) {
                      focusKey.current = null;
                      el.focus();
                    }
                  }}
                  type="text"
                  value={row.title}
                  onChange={(e) => updateRow(row.key, "title", e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key !== "Enter") return;
                    e.preventDefault();
                    insertAfter(index);
                  }}
                  placeholder="Module title, e.g. Advanced Pregnancy Yoga"
                  aria-label={`Module ${index + 1} title`}
                  maxLength={MODULE_TITLE_MAX}
                  className={inputClass}
                  disabled={disabled}
                />
                <div className="flex shrink-0 items-center">
                  <IconButton
                    label="Move up"
                    onClick={() => moveRow(index, -1)}
                    disabled={disabled || index === 0}
                  >
                    <ArrowUp size={16} aria-hidden="true" />
                  </IconButton>
                  <IconButton
                    label="Move down"
                    onClick={() => moveRow(index, 1)}
                    disabled={disabled || index === rows.length - 1}
                  >
                    <ArrowDown size={16} aria-hidden="true" />
                  </IconButton>
                  <IconButton
                    label={`Remove module ${index + 1}`}
                    danger
                    onClick={() => removeRow(row.key)}
                    disabled={disabled}
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </IconButton>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:pl-9 md:grid-cols-2">
                <div className="flex flex-col">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <label
                      htmlFor={`${row.key}-description`}
                      className="text-xs font-medium text-gray-600"
                    >
                      Short description <span className="font-normal text-gray-400">(optional)</span>
                    </label>
                    <span className="text-xs tabular-nums text-gray-400">
                      {row.description.length}/{MODULE_DESCRIPTION_MAX}
                    </span>
                  </div>
                  <textarea
                    id={`${row.key}-description`}
                    rows={2}
                    value={row.description}
                    onChange={(e) => updateRow(row.key, "description", e.target.value)}
                    placeholder="What the mother learns in this module"
                    maxLength={MODULE_DESCRIPTION_MAX}
                    className={`${inputClass} resize-y`}
                    disabled={disabled}
                  />
                </div>

                <div className="flex flex-col">
                  <label
                    htmlFor={`${row.key}-video`}
                    className="mb-1 text-xs font-medium text-gray-600"
                  >
                    Video link <span className="font-normal text-gray-400">(optional)</span>
                  </label>
                  <input
                    id={`${row.key}-video`}
                    type="text"
                    inputMode="url"
                    value={row.videoUrl}
                    onChange={(e) => updateRow(row.key, "videoUrl", e.target.value)}
                    placeholder="https://youtu.be/..."
                    maxLength={MODULE_VIDEO_URL_MAX}
                    className={`${inputClass} ${
                      link && !isValidVideoLink(link) ? "border-red-400" : ""
                    }`}
                    disabled={disabled}
                  />
                  <p className="mt-1 text-xs">
                    <LinkHint
                      link={link}
                      previewOpen={showPreview}
                      onTogglePreview={() =>
                        setPreviewKey(showPreview ? null : row.key)
                      }
                    />
                  </p>
                </div>
              </div>

              {showPreview ? (
                <div className="sm:pl-9">
                  <ModuleVideo url={link} title={row.title} />
                </div>
              ) : null}
            </div>
          );
        })
      ) : (
        <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
          No modules yet. Add the first one below.
        </div>
      )}

      {atLimit ? (
        <p className="text-sm text-gray-500">
          A package can have at most {MODULES_MAX} modules.
        </p>
      ) : (
        <button
          type="button"
          onClick={() => insertAfter(rows.length - 1)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:underline"
          disabled={disabled}
        >
          <Plus size={16} aria-hidden="true" />
          Add module
        </button>
      )}
    </div>
  );
};

export default ModulesEditor;
