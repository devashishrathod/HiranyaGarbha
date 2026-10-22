import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { ExternalLink, Eye, Pencil, Plus, Trash2, Youtube } from "lucide-react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { getApiErrorMessage, useApiMutation, useGetQuery } from "../../api/apiCall";
import API_ENDPOINTS from "../../api/apiEndpoint";
import axiosInstance from "../../api/axiosInstance";
import LinkifiedText from "../../components/UI/LinkifiedText";
import Toggle from "../../components/UI/Toggle";
import YouTubePlayer from "../../components/UI/YouTubePlayer";
import { EmptyState, InlineLoader, Pill } from "../../components/UI/kit";
import {
  PLAN_VIDEO_SORTS,
  VIDEO_TRIMESTERS,
  VIDEO_TRIMESTER_LABELS,
} from "../../constants/planVideo";
import formatGrammer from "../../utils/formatGrammer";
import GalleryTabs from "./GalleryTabs";
import { PlanChips, TrimesterChips } from "./PlanVideoChips";
import PlanVideoFormModal from "./PlanVideoFormModal";
import useGallerySubCategories from "./useGallerySubCategories";

const PAGE_SIZE = 12;

const EMPTY_FILTERS = {
  subCategoryId: "",
  packageId: "",
  trimester: "",
  isActive: "",
  fromDate: "",
  toDate: "",
  sort: "createdAt:desc",
};
const QUERY_FILTERS = ["subCategoryId", "packageId", "trimester", "isActive", "fromDate", "toDate"];

const CONTROL =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

const TWO_LINES = {
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
};

// Clicks on the card's own controls must not open the details page.
const stop = (handler) => (e) => {
  e.stopPropagation();
  handler?.(e);
};

const PlanVideoCard = ({ video, onOpen, onEdit, onDelete, onToggle, busy }) => (
  <div
    role="button"
    tabIndex={0}
    onClick={onOpen}
    onKeyDown={(e) => {
      if (e.key === "Enter") onOpen();
    }}
    className="flex flex-col rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:shadow-md"
  >
    <YouTubePlayer videoId={video.youtubeId} title={video.name} autoplay />

    <div className="mt-3 flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <div className="truncate text-base font-bold text-slate-900">{video.name}</div>
        {video.subCategory?.name ? (
          <div className="mt-0.5 text-xs font-medium text-indigo-600">
            {formatGrammer(video.subCategory.name)}
          </div>
        ) : null}
      </div>
      <div onClick={stop()} onKeyDown={stop()} role="presentation">
        <Toggle
          checked={!!video.isActive}
          onChange={onToggle}
          disabled={busy}
          label={video.isActive ? "Deactivate" : "Activate"}
        />
      </div>
    </div>

    <div className="mt-2 flex flex-wrap gap-1.5">
      <PlanChips packages={video.packages} />
      <TrimesterChips trimesters={video.trimesters} />
      {video.isActive ? null : <Pill tone="slate">Inactive</Pill>}
    </div>

    <div className="mt-3 text-sm text-slate-600" style={TWO_LINES} title={video.description}>
      <LinkifiedText text={video.description} />
    </div>

    <div className="mt-auto flex items-center justify-end gap-2 pt-4">
      <a
        href={video.videoUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={stop()}
        className="mr-auto inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:underline"
        title="Open in YouTube"
      >
        <ExternalLink size={14} /> YouTube
      </a>
      <button
        type="button"
        onClick={stop(onOpen)}
        className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white p-2 text-slate-700 hover:bg-slate-50"
        title="View"
      >
        <Eye size={18} />
      </button>
      <button
        type="button"
        onClick={stop(onEdit)}
        className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white p-2 text-slate-700 hover:bg-slate-50"
        disabled={busy}
        title="Edit"
      >
        <Pencil size={18} />
      </button>
      <button
        type="button"
        onClick={stop(onDelete)}
        className="inline-flex items-center justify-center rounded-lg bg-red-600 p-2 text-white hover:bg-red-700"
        disabled={busy}
        title="Delete"
      >
        <Trash2 size={18} />
      </button>
    </div>
  </div>
);

export const PlanVideosPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { subCategories } = useGallerySubCategories();

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  // null: closed, {}: adding, a video: editing it
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data: packagesData } = useGetQuery(
    `${API_ENDPOINTS.SUBSCRIPTIONS.GET_PACKAGES}?includeInactive=true`,
    ["packages", "includeInactive"],
  );
  const packages = packagesData?.data?.packages || [];

  const query = useMemo(() => {
    const [sortBy, sortOrder] = filters.sort.split(":");
    const params = new URLSearchParams({ limit: String(PAGE_SIZE), sortBy, sortOrder });
    if (search) params.set("search", search);
    for (const key of QUERY_FILTERS) {
      if (filters[key]) params.set(key, filters[key]);
    }
    return params.toString();
  }, [filters, search]);

  const list = useInfiniteQuery({
    queryKey: ["planVideos", query],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      try {
        const response = await axiosInstance.get(
          `${API_ENDPOINTS.PLAN_VIDEOS.GET_ALL}?${query}&page=${pageParam}`,
        );
        return response.data.data;
      } catch (error) {
        // The list answers 404 when nothing matches — an empty page, not a failure.
        if (error?.response?.status === 404) {
          return { data: [], total: 0, totalPages: 0, page: pageParam };
        }
        throw error;
      }
    },
    getNextPageParam: (last) => (last.page < last.totalPages ? last.page + 1 : undefined),
  });

  const videos = useMemo(
    () => list.data?.pages.flatMap((page) => page.data) || [],
    [list.data],
  );
  const total = list.data?.pages[0]?.total || 0;

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["planVideos"] });

  const update = useApiMutation({
    method: "put",
    onSuccess: (response) => {
      toast.success(response?.message || "Video updated");
      refresh();
    },
  });
  const remove = useApiMutation({
    method: "delete",
    onSuccess: (response) => {
      toast.success(response?.message || "Video deleted");
      refresh();
    },
  });
  const busy = update.isPending || remove.isPending;

  const toggleActive = (video) =>
    update.mutate({
      url: API_ENDPOINTS.PLAN_VIDEOS.UPDATE.replace(":id", video._id),
      data: { isActive: !video.isActive },
    });

  const deleteVideo = (video) => {
    if (!window.confirm(`Delete "${video.name}"? Patients will stop seeing it.`)) return;
    remove.mutate({ url: API_ENDPOINTS.PLAN_VIDEOS.DELETE.replace(":id", video._id) });
  };

  const setFilter = (key) => (e) => setFilters((prev) => ({ ...prev, [key]: e.target.value }));
  const hasFilters =
    !!search || QUERY_FILTERS.some((key) => filters[key]) || filters.sort !== EMPTY_FILTERS.sort;
  const clearFilters = () => {
    setSearchInput("");
    setSearch("");
    setFilters(EMPTY_FILTERS);
  };

  return (
    <div className="p-4">
      <GalleryTabs />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-lg font-semibold text-slate-800">YouTube Videos</div>
          <div className="mt-1 text-sm text-slate-600">
            YouTube videos for patients, by plan and trimester. Showing {videos.length} of{" "}
            {total}.
          </div>
        </div>
        <button
          type="button"
          onClick={() => setEditing({})}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <Plus size={16} /> Add Video
        </button>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search name or description..."
          className={`${CONTROL} sm:col-span-2`}
          aria-label="Search"
        />
        <select value={filters.packageId} onChange={setFilter("packageId")} className={CONTROL} aria-label="Plan">
          <option value="">All plans</option>
          {packages.map((pkg) => (
            <option key={pkg._id} value={pkg._id}>
              {pkg.name}
              {pkg.isActive ? "" : " (inactive)"}
            </option>
          ))}
        </select>
        <select value={filters.trimester} onChange={setFilter("trimester")} className={CONTROL} aria-label="Trimester">
          <option value="">All trimesters</option>
          {VIDEO_TRIMESTERS.map((trimester) => (
            <option key={trimester} value={trimester}>
              {VIDEO_TRIMESTER_LABELS[trimester]}
            </option>
          ))}
        </select>
        <select value={filters.subCategoryId} onChange={setFilter("subCategoryId")} className={CONTROL} aria-label="Subcategory">
          <option value="">All subcategories</option>
          {subCategories.map((sub) => (
            <option key={sub._id} value={sub._id}>
              {formatGrammer(sub.name)}
            </option>
          ))}
        </select>
        <select value={filters.isActive} onChange={setFilter("isActive")} className={CONTROL} aria-label="Status">
          <option value="">Active and inactive</option>
          <option value="true">Active only</option>
          <option value="false">Inactive only</option>
        </select>
        <label className="flex items-center gap-2 text-xs text-slate-500">
          From
          <input type="date" value={filters.fromDate} onChange={setFilter("fromDate")} className={CONTROL} />
        </label>
        <label className="flex items-center gap-2 text-xs text-slate-500">
          To
          <input type="date" value={filters.toDate} onChange={setFilter("toDate")} className={CONTROL} />
        </label>
        <select value={filters.sort} onChange={setFilter("sort")} className={CONTROL} aria-label="Sort">
          {PLAN_VIDEO_SORTS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {hasFilters ? (
          <button
            type="button"
            onClick={clearFilters}
            className="text-left text-sm font-semibold text-blue-700 hover:underline lg:col-span-3"
          >
            Clear filters
          </button>
        ) : null}
      </div>

      {list.isLoading ? <InlineLoader label="Loading videos..." /> : null}

      {list.isError ? (
        <div className="rounded border border-red-200 bg-red-50 p-4">
          <h3 className="font-bold text-red-600">Could not load the videos</h3>
          <p className="mt-1 text-sm text-red-700">{getApiErrorMessage(list.error)}</p>
          <button
            type="button"
            onClick={() => list.refetch()}
            className="mt-3 rounded bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      ) : null}

      {!list.isLoading && !list.isError && videos.length === 0 ? (
        <EmptyState
          icon={Youtube}
          title={hasFilters ? "No videos match these filters" : "No YouTube videos yet"}
          message={
            hasFilters
              ? "Try a different search or clear the filters."
              : "Add a YouTube link and pick the plans and trimesters that get it."
          }
          action={
            hasFilters ? (
              <button type="button" onClick={clearFilters} className="text-sm font-semibold text-blue-700 hover:underline">
                Clear filters
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setEditing({})}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Add Video
              </button>
            )
          }
        />
      ) : null}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {videos.map((video) => (
          <PlanVideoCard
            key={video._id}
            video={video}
            busy={busy}
            onOpen={() => navigate(`/gallery/videos/${video._id}`)}
            onEdit={() => setEditing(video)}
            onDelete={() => deleteVideo(video)}
            onToggle={() => toggleActive(video)}
          />
        ))}
      </div>

      {videos.length > 0 ? (
        <div className="mt-6 flex justify-center">
          {list.hasNextPage ? (
            <button
              type="button"
              onClick={() => list.fetchNextPage()}
              className="rounded-lg bg-slate-900 px-6 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
              disabled={list.isFetchingNextPage}
            >
              {list.isFetchingNextPage ? "Loading..." : "Load More"}
            </button>
          ) : (
            <div className="text-sm text-slate-500">No more videos</div>
          )}
        </div>
      ) : null}

      {editing ? (
        <PlanVideoFormModal
          key={editing._id || "new"}
          video={editing._id ? editing : null}
          onClose={() => setEditing(null)}
          onSaved={refresh}
        />
      ) : null}
    </div>
  );
};
