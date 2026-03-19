import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Loader from "../../components/UI/Loader";
import NotFound from "../../components/UI/NotFound";
import { useGetQuery } from "../../api/apiCall";
import API_ENDPOINTS from "../../api/apiEndpoint";
import formatGrammer from "../../utils/formatGrammer";

export const GalleryDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const endpoint = useMemo(() => {
    if (!id) return null;
    return API_ENDPOINTS.BANNERS.GET_ONE.replace(":id", id);
  }, [id]);

  const { data, isLoading, error, refetch } = useGetQuery(endpoint, [
    "banner",
    id,
  ]);

  const banner = data?.data || data?.result || data;

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader size={100} color="#3B82F6" className="text-center" />
      </div>
    );
  }

  const isNotFound = error?.response?.status === 404;

  if (error) {
    if (isNotFound) {
      return (
        <div className="p-4">
          <NotFound
            title="Gallery item not found"
            type="gallery"
            message={error?.response?.data?.message || "Not found"}
            actionText="Back to Gallery"
            onAction={() => navigate("/gallery")}
          />
        </div>
      );
    }

    return (
      <div className="p-4">
        <div className="rounded border border-red-200 bg-red-50 p-4">
          <h3 className="font-bold text-red-600">Something went wrong</h3>
          <p className="mt-1 text-sm text-red-700">{error.message}</p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => navigate("/gallery")}
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

  if (!banner?._id) {
    return (
      <div className="p-4">
        <NotFound
          title="Gallery item not found"
          type="gallery"
          message="Not found"
          actionText="Back to Gallery"
          onAction={() => navigate("/gallery")}
        />
      </div>
    );
  }

  const subCategoryName = formatGrammer(
    banner?.subCategoryId?.name || banner?.subCategory?.name || "",
  );
  const categoryName = formatGrammer(
    banner?.subCategoryId?.categoryId?.name || banner?.category?.name || "",
  );

  const hasVideo = !!banner?.video;

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <div className="text-lg font-semibold text-slate-800">
            Gallery Item Details
          </div>
          <div className="mt-1 text-sm text-slate-600">{banner?._id || ""}</div>
        </div>

        <button
          type="button"
          onClick={() => navigate("/gallery")}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Back
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          {hasVideo ? (
            <video
              src={banner.video}
              controls
              autoPlay
              muted
              loop
              playsInline
              className="w-full rounded-lg bg-black"
            />
          ) : (
            <img
              src={banner.image || "/images/default.png"}
              alt={banner.name || "-"}
              className="w-full rounded-lg object-cover"
            />
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-xl font-bold text-slate-900">
            {formatGrammer(banner.name || "-")}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
              {subCategoryName}
            </span>
            <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              {categoryName}
            </span>
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                banner.isActive
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-200 text-slate-700"
              }`}
            >
              {banner.isActive ? "Active" : "Inactive"}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 text-sm">
            <div>
              <div className="text-xs font-semibold text-slate-500">Name</div>
              <div className="mt-0.5 text-slate-800">
                {formatGrammer(banner.name || "-")}
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-slate-500">
                Description
              </div>
              <div className="mt-0.5 whitespace-pre-wrap text-slate-800">
                {formatGrammer(banner.description || "-")}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <div className="text-xs font-semibold text-slate-500">
                  Subcategory
                </div>
                <div className="mt-0.5 text-slate-800">{subCategoryName}</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500">
                  Category
                </div>
                <div className="mt-0.5 text-slate-800">{categoryName}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <div className="text-xs font-semibold text-slate-500">
                  Created At
                </div>
                <div className="mt-0.5 text-slate-800">
                  {banner.createdAt
                    ? new Date(banner.createdAt).toLocaleString()
                    : "-"}
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500">
                  Updated At
                </div>
                <div className="mt-0.5 text-slate-800">
                  {banner.updatedAt
                    ? new Date(banner.updatedAt).toLocaleString()
                    : "-"}
                </div>
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-slate-500">Media</div>
              <div className="mt-0.5 text-slate-800">
                {hasVideo ? "Video" : "Image"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
