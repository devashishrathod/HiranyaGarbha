import { useState } from "react";
import { ExternalLink, Pencil } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";

import { useGetQuery } from "../../api/apiCall";
import API_ENDPOINTS from "../../api/apiEndpoint";
import LinkifiedText from "../../components/UI/LinkifiedText";
import Loader from "../../components/UI/Loader";
import NotFound from "../../components/UI/NotFound";
import YouTubePlayer from "../../components/UI/YouTubePlayer";
import { Pill } from "../../components/UI/kit";
import formatGrammer from "../../utils/formatGrammer";
import { PlanChips, TrimesterChips } from "./PlanVideoChips";
import PlanVideoFormModal from "./PlanVideoFormModal";

const Detail = ({ label, children }) => (
  <div>
    <div className="text-xs font-semibold text-slate-500">{label}</div>
    <div className="mt-0.5 text-slate-800">{children}</div>
  </div>
);

const formatDate = (value) => (value ? new Date(value).toLocaleString() : "-");

export const PlanVideoDetails = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams();
  const [editing, setEditing] = useState(false);

  const { data, isLoading, error, refetch } = useGetQuery(
    id ? API_ENDPOINTS.PLAN_VIDEOS.GET_ONE.replace(":id", id) : null,
    ["planVideo", id],
  );
  const video = data?.data;
  const back = () => navigate("/gallery/videos");

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader size={100} color="#3B82F6" className="text-center" />
      </div>
    );
  }

  if (error?.response?.status === 404 || (!error && !video?._id)) {
    return (
      <div className="p-4">
        <NotFound
          title="Video not found"
          type="gallery"
          message={error?.response?.data?.message || "It may have been deleted."}
          actionText="Back to Plan Videos"
          onAction={back}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="rounded border border-red-200 bg-red-50 p-4">
          <h3 className="font-bold text-red-600">Something went wrong</h3>
          <p className="mt-1 text-sm text-red-700">{error.message}</p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={back}
              className="rounded border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => refetch()}
              className="rounded bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-lg font-semibold text-slate-800">Plan Video Details</div>
          <div className="mt-1 text-sm text-slate-600">{video._id}</div>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={video.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 hover:bg-slate-50"
          >
            <ExternalLink size={16} /> Open in YouTube
          </a>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Pencil size={16} /> Edit
          </button>
          <button
            type="button"
            onClick={back}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Back
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <YouTubePlayer videoId={video.youtubeId} title={video.name} autoplay />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-xl font-bold text-slate-900">{video.name}</div>

          <div className="mt-3 flex flex-wrap gap-2">
            <PlanChips packages={video.packages} />
            <TrimesterChips trimesters={video.trimesters} />
            <Pill tone={video.isActive ? "green" : "slate"}>
              {video.isActive ? "Active" : "Inactive"}
            </Pill>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 text-sm">
            <Detail label="Description">
              <div className="whitespace-pre-wrap">
                <LinkifiedText text={video.description} />
              </div>
            </Detail>

            <Detail label="YouTube link">
              <LinkifiedText text={video.videoUrl} />
            </Detail>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Detail label="Subcategory">
                {video.subCategory?.name ? formatGrammer(video.subCategory.name) : "-"}
              </Detail>
              <Detail label="Category">
                {video.category?.name ? formatGrammer(video.category.name) : "-"}
              </Detail>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Detail label="Created At">{formatDate(video.createdAt)}</Detail>
              <Detail label="Updated At">{formatDate(video.updatedAt)}</Detail>
            </div>
          </div>
        </div>
      </div>

      {editing ? (
        <PlanVideoFormModal
          key={video._id}
          video={video}
          onClose={() => setEditing(false)}
          onSaved={() => {
            queryClient.invalidateQueries({ queryKey: ["planVideo", id] });
            queryClient.invalidateQueries({ queryKey: ["planVideos"] });
          }}
        />
      ) : null}
    </div>
  );
};
