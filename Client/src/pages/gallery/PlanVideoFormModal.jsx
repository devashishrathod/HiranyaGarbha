import { useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { ExternalLink } from "lucide-react";

import { useApiMutation, useGetQuery } from "../../api/apiCall";
import API_ENDPOINTS from "../../api/apiEndpoint";
import CharCount from "../../components/UI/CharCount";
import Toggle from "../../components/UI/Toggle";
import YouTubePlayer from "../../components/UI/YouTubePlayer";
import { Button, Modal } from "../../components/UI/kit";
import {
  PLAN_VIDEO_LIMITS,
  VIDEO_TRIMESTERS,
  VIDEO_TRIMESTER_LABELS,
} from "../../constants/planVideo";
import formatGrammer from "../../utils/formatGrammer";
import { extractYoutubeId, youtubeWatchUrl } from "../../utils/youtube";
import useGallerySubCategories from "./useGallerySubCategories";

const FORM_ID = "plan-video-form";
const CONTROL =
  "mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 disabled:bg-slate-50";
const LABEL = "block text-sm font-medium text-slate-700";

const toForm = (video) => ({
  name: video?.name || "",
  description: video?.description || "",
  videoUrl: video?.videoUrl || "",
  // From `packages`, which leaves out deleted packages the server would refuse.
  packageIds: (video?.packages || []).map((pkg) => pkg._id),
  trimesters: video?.trimesters || [],
  subCategoryId: video?.subCategory?._id || "",
  isActive: typeof video?.isActive === "boolean" ? video.isActive : true,
});

const toggleIn = (list, value) =>
  list.includes(value) ? list.filter((item) => item !== value) : [...list, value];

/** What still stops the form from saving, in words for the hint line. */
const whatIsMissing = (form, youtubeId) => {
  const { NAME_MIN, NAME_MAX, DESCRIPTION_MAX } = PLAN_VIDEO_LIMITS;
  const name = form.name.trim();
  const description = form.description.trim();
  const missing = [];

  if (!name) missing.push("name");
  else if (name.length < NAME_MIN) missing.push(`name of ${NAME_MIN}+ characters`);
  // The inputs stop at the limits; only an older record can be over them.
  else if (name.length > NAME_MAX) missing.push(`name of at most ${NAME_MAX} characters`);
  if (!description) missing.push("description");
  else if (description.length > DESCRIPTION_MAX) {
    missing.push(`description of at most ${DESCRIPTION_MAX} characters`);
  }
  if (!youtubeId) missing.push("YouTube link");
  if (!form.packageIds.length) missing.push("plan");
  if (!form.trimesters.length) missing.push("trimester");
  return missing;
};

/**
 * Add or edit a plan video. Mount it afresh for each open (key it on the
 * video) so the form always starts from the video being edited.
 */
const PlanVideoFormModal = ({ video, onClose, onSaved }) => {
  const isEdit = !!video?._id;
  const initial = useMemo(() => toForm(video), [video]);
  const [form, setForm] = useState(initial);
  const { subCategories } = useGallerySubCategories();

  const { data: packagesData, isLoading: packagesLoading } = useGetQuery(
    `${API_ENDPOINTS.SUBSCRIPTIONS.GET_PACKAGES}?includeInactive=true`,
    ["packages", "includeInactive"],
  );

  // Main packages only — bonus courses come back separately and are left out.
  // An inactive package is offered only while this video is already on it,
  // so saving can never drop it without the admin seeing it.
  const planOptions = useMemo(
    () =>
      (packagesData?.data?.packages || []).filter(
        (pkg) => pkg.isActive || initial.packageIds.includes(pkg._id),
      ),
    [packagesData, initial],
  );

  const youtubeId = extractYoutubeId(form.videoUrl);
  const linkError =
    form.videoUrl.trim() && !youtubeId
      ? "Not a YouTube video link. Paste a watch, youtu.be, Shorts or live link."
      : "";
  const missing = whatIsMissing(form, youtubeId);

  const save = useApiMutation({
    onSuccess: (response) => {
      toast.success(
        response?.message || (isEdit ? "Video updated" : "Video added"),
      );
      onSaved?.(response?.data);
      onClose();
    },
  });

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));
  const close = () => {
    if (!save.isPending) onClose();
  };

  const allPlansPicked =
    planOptions.length > 0 &&
    planOptions.every((pkg) => form.packageIds.includes(pkg._id));
  const allTrimestersPicked = VIDEO_TRIMESTERS.every((t) =>
    form.trimesters.includes(t),
  );

  const submit = (e) => {
    e.preventDefault();
    if (missing.length || save.isPending) return;

    save.mutate({
      url: isEdit
        ? API_ENDPOINTS.PLAN_VIDEOS.UPDATE.replace(":id", video._id)
        : API_ENDPOINTS.PLAN_VIDEOS.CREATE,
      method: isEdit ? "put" : "post",
      data: {
        name: form.name.trim(),
        description: form.description.trim(),
        videoUrl: form.videoUrl.trim(),
        packageIds: form.packageIds,
        trimesters: form.trimesters,
        subCategoryId: form.subCategoryId || null,
        isActive: form.isActive,
      },
    });
  };

  return (
    <Modal
      open
      size="lg"
      title={isEdit ? "Edit Plan Video" : "Add Plan Video"}
      description="Paste a YouTube link and choose which plans and trimesters get it."
      onClose={close}
      footer={
        <>
          {missing.length ? (
            <p className="mr-auto text-xs text-slate-500">
              Still needed: {missing.join(", ")}
            </p>
          ) : null}
          <Button variant="secondary" onClick={close} disabled={save.isPending}>
            Cancel
          </Button>
          <Button
            type="submit"
            form={FORM_ID}
            disabled={missing.length > 0}
            loading={save.isPending}
          >
            {isEdit ? "Update" : "Create"}
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={submit} className="grid grid-cols-1 gap-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="pv-name" className={LABEL}>
                Name
              </label>
              <CharCount length={form.name.length} max={PLAN_VIDEO_LIMITS.NAME_MAX} />
            </div>
            <input
              id="pv-name"
              value={form.name}
              onChange={set("name")}
              maxLength={PLAN_VIDEO_LIMITS.NAME_MAX}
              className={CONTROL}
              placeholder="Enter name"
              disabled={save.isPending}
            />
          </div>

          <div>
            <label htmlFor="pv-subcategory" className={LABEL}>
              Subcategory <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <select
              id="pv-subcategory"
              value={form.subCategoryId}
              onChange={set("subCategoryId")}
              className={CONTROL}
              disabled={save.isPending}
            >
              <option value="">None</option>
              {subCategories.map((sub) => (
                <option key={sub._id} value={sub._id}>
                  {formatGrammer(sub.name)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between gap-2">
            <label htmlFor="pv-description" className={LABEL}>
              Description
            </label>
            <CharCount
              length={form.description.length}
              max={PLAN_VIDEO_LIMITS.DESCRIPTION_MAX}
            />
          </div>
          <textarea
            id="pv-description"
            value={form.description}
            onChange={set("description")}
            maxLength={PLAN_VIDEO_LIMITS.DESCRIPTION_MAX}
            rows={3}
            className={CONTROL}
            placeholder="Enter description. Links like https://... become clickable."
            disabled={save.isPending}
          />
        </div>

        <div>
          <label htmlFor="pv-link" className={LABEL}>
            YouTube link
          </label>
          <input
            id="pv-link"
            value={form.videoUrl}
            onChange={set("videoUrl")}
            className={`${CONTROL} ${linkError ? "border-red-300 focus:border-red-400" : ""}`}
            placeholder="https://youtu.be/..."
            inputMode="url"
            disabled={save.isPending}
          />
          {linkError ? (
            <p className="mt-1 text-xs text-red-600">{linkError}</p>
          ) : (
            <p className="mt-1 text-xs text-slate-500">
              The video must be Public or Unlisted on YouTube, or it will not play.
            </p>
          )}
          {youtubeId ? (
            <div className="mt-3 space-y-2">
              <YouTubePlayer videoId={youtubeId} title="Preview" className="max-h-72" />
              <a
                href={youtubeWatchUrl(youtubeId)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:underline"
              >
                <ExternalLink size={14} /> Open in YouTube
              </a>
            </div>
          ) : null}
        </div>

        <fieldset>
          <div className="flex items-center justify-between gap-2">
            <legend className={LABEL}>Plans</legend>
            {planOptions.length > 1 ? (
              <button
                type="button"
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    packageIds: allPlansPicked ? [] : planOptions.map((pkg) => pkg._id),
                  }))
                }
                className="text-xs font-semibold text-blue-700 hover:underline"
                disabled={save.isPending}
              >
                {allPlansPicked ? "Clear all" : "Select all"}
              </button>
            ) : null}
          </div>
          {packagesLoading ? (
            <p className="mt-2 text-sm text-slate-500">Loading plans...</p>
          ) : planOptions.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">
              No packages yet. Create them under Packages first.
            </p>
          ) : (
            <div className="mt-2 flex flex-wrap gap-2">
              {planOptions.map((pkg) => (
                <label
                  key={pkg._id}
                  className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                    form.packageIds.includes(pkg._id)
                      ? "border-blue-300 bg-blue-50 text-blue-800"
                      : "border-slate-200 text-slate-700"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={form.packageIds.includes(pkg._id)}
                    onChange={() =>
                      setForm((prev) => ({
                        ...prev,
                        packageIds: toggleIn(prev.packageIds, pkg._id),
                      }))
                    }
                    disabled={save.isPending}
                  />
                  {pkg.name}
                  {pkg.isActive ? null : (
                    <span className="text-xs text-slate-400">(inactive)</span>
                  )}
                </label>
              ))}
            </div>
          )}
          <p className="mt-1 text-xs text-slate-500">
            Basic videos are open to everyone, even without logging in.
          </p>
        </fieldset>

        <fieldset>
          <legend className={LABEL}>Trimester</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            <label
              className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                allTrimestersPicked
                  ? "border-teal-300 bg-teal-50 text-teal-800"
                  : "border-slate-200 text-slate-700"
              }`}
            >
              <input
                type="checkbox"
                checked={allTrimestersPicked}
                onChange={() =>
                  setForm((prev) => ({
                    ...prev,
                    trimesters: allTrimestersPicked ? [] : [...VIDEO_TRIMESTERS],
                  }))
                }
                disabled={save.isPending}
              />
              All trimesters
            </label>
            {VIDEO_TRIMESTERS.map((trimester) => (
              <label
                key={trimester}
                className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                  form.trimesters.includes(trimester)
                    ? "border-teal-300 bg-teal-50 text-teal-800"
                    : "border-slate-200 text-slate-700"
                }`}
              >
                <input
                  type="checkbox"
                  checked={form.trimesters.includes(trimester)}
                  onChange={() =>
                    setForm((prev) => ({
                      ...prev,
                      trimesters: toggleIn(prev.trimesters, trimester),
                    }))
                  }
                  disabled={save.isPending}
                />
                {VIDEO_TRIMESTER_LABELS[trimester]}
              </label>
            ))}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            A Pro or Elite patient sees videos from the trimester they joined in
            onwards — joined in the 2nd, they get 2nd and 3rd.
          </p>
        </fieldset>

        <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
          <div>
            <div className="text-sm font-medium text-slate-800">Active</div>
            <div className="text-xs text-slate-500">
              Inactive videos stay here but are hidden from the app.
            </div>
          </div>
          <Toggle
            checked={form.isActive}
            onChange={() => setForm((prev) => ({ ...prev, isActive: !prev.isActive }))}
            disabled={save.isPending}
            label="Active"
          />
        </div>
      </form>
    </Modal>
  );
};

export default PlanVideoFormModal;
