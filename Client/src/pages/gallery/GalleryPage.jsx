import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { Eye, Minus, Plus } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

import Table from "../../components/UI/Table";
import Loader from "../../components/UI/Loader";
import NotFound from "../../components/UI/NotFound";
import Pagination from "../../components/UI/Pagination";

import {
  useDeleteMutation,
  useGetQuery,
  usePostMutation,
} from "../../api/apiCall";
import API_ENDPOINTS from "../../api/apiEndpoint";
import axiosInstance from "../../api/axiosInstance";

const getApiMessage = (res, fallback) => {
  return res?.message || res?.data?.message || fallback;
};

const VideoPreviewModal = ({ open, onClose, src, title }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-3xl rounded-xl bg-white p-4 shadow-xl">
        <div className="flex items-center justify-between gap-3 border-b pb-3">
          <h3 className="text-base font-semibold text-slate-800">
            {title || "Video Preview"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1 text-sm font-semibold text-slate-600 hover:bg-slate-100"
          >
            Close
          </button>
        </div>

        <div className="mt-4">
          {src ? (
            <video
              src={src}
              controls
              className="h-[60vh] w-full rounded-lg bg-black"
            />
          ) : (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              No video available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ImagePreviewModal = ({ open, onClose, src, title }) => {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (!open) return;
    setScale(1);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-5xl rounded-xl bg-white p-4 shadow-xl">
        <div className="flex items-center justify-between gap-3 border-b pb-3">
          <h3 className="text-base font-semibold text-slate-800">
            {title || "Image Preview"}
          </h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setScale((s) => Math.max(0.5, Number((s - 0.25).toFixed(2))))
              }
              className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Minus className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() =>
                setScale((s) => Math.min(5, Number((s + 0.25).toFixed(2))))
              }
              className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Plus className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-3 py-1 text-sm font-semibold text-slate-600 hover:bg-slate-100"
            >
              Close
            </button>
          </div>
        </div>

        <div className="mt-4 max-h-[70vh] overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-2">
          {src ? (
            <div className="flex w-full justify-center">
              <img
                src={src}
                alt={title || "Preview"}
                style={{
                  transform: `scale(${scale})`,
                  transformOrigin: "top center",
                }}
                className="max-w-full select-none"
                draggable={false}
              />
            </div>
          ) : (
            <div className="p-4 text-sm text-slate-600">No image available</div>
          )}
        </div>
      </div>
    </div>
  );
};

const BannerAddEditModal = ({
  open,
  onClose,
  mode,
  initial,
  categories,
  onSubmit,
  isSubmitting,
}) => {
  const fileRefImage = useRef(null);
  const fileRefVideo = useRef(null);
  const [imagePreview, setImagePreview] = useState("");
  const [videoPreview, setVideoPreview] = useState("");
  const [removeExisting, setRemoveExisting] = useState({
    image: false,
    video: false,
  });

  const [form, setForm] = useState({
    name: "",
    description: "",
    categoryId: "",
    isActive: true,
    image: null,
    video: null,
  });

  useEffect(() => {
    if (!open) return;

    setForm({
      name: initial?.name || "",
      description: initial?.description || "",
      categoryId: initial?.categoryId || initial?.category?._id || "",
      isActive:
        typeof initial?.isActive === "boolean" ? initial.isActive : true,
      image: null,
      video: null,
    });

    setImagePreview(initial?.image || "");
    setVideoPreview(initial?.video || "");
    setRemoveExisting({ image: false, video: false });

    if (fileRefImage.current) fileRefImage.current.value = "";
    if (fileRefVideo.current) fileRefVideo.current.value = "";
  }, [open, initial]);

  useEffect(() => {
    if (!open) return;
    if (!form.image) return;

    const url = URL.createObjectURL(form.image);
    setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [open, form.image]);

  useEffect(() => {
    if (!open) return;
    if (!form.video) return;

    const url = URL.createObjectURL(form.video);
    setVideoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [open, form.video]);

  if (!open) return null;

  const onChange = (key) => (e) => {
    const value =
      e?.target?.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onFile = (key) => (e) => {
    const file = e.target.files?.[0] || null;
    setForm((prev) => ({ ...prev, [key]: file }));
    if (file) clearRemoveFlagOnNewUpload(key);
  };

  const handleRemoveFile = (key) => {
    setForm((prev) => ({ ...prev, [key]: null }));
    if (key === "image") {
      setImagePreview("");
      if (fileRefImage.current) fileRefImage.current.value = "";
      if (mode === "edit" && initial?.image) {
        setRemoveExisting((prev) => ({ ...prev, image: true }));
      }
    }
    if (key === "video") {
      setVideoPreview("");
      if (fileRefVideo.current) fileRefVideo.current.value = "";
      if (mode === "edit" && initial?.video) {
        setRemoveExisting((prev) => ({ ...prev, video: true }));
      }
    }
  };

  const clearRemoveFlagOnNewUpload = (key) => {
    if (mode !== "edit") return;
    setRemoveExisting((prev) => ({ ...prev, [key]: false }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!form.categoryId) {
      toast.error("Category is required");
      return;
    }

    const fd = new FormData();
    fd.append("name", form.name.trim());
    fd.append("description", form.description?.trim() || "");
    fd.append("categoryId", form.categoryId);
    fd.append("isActive", String(form.isActive));
    if (form.image) fd.append("image", form.image);
    if (form.video) fd.append("video", form.video);

    if (mode === "edit") {
      if (removeExisting.image) fd.append("removeImage", "true");
      if (removeExisting.video) fd.append("removeVideo", "true");
    }

    onSubmit(fd);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-2xl rounded-xl bg-white p-5 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">
              {mode === "edit" ? "Edit Gallery Item" : "Add Gallery Item"}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Upload image/video and map it to a category.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1 text-sm font-semibold text-slate-600 hover:bg-slate-100"
          >
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 grid grid-cols-1 gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Name
              </label>
              <input
                value={form.name}
                onChange={onChange("name")}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
                placeholder="Enter name"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Category
              </label>
              <select
                value={form.categoryId}
                onChange={onChange("categoryId")}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
                disabled={isSubmitting}
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={onChange("description")}
              rows={3}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
              placeholder="Enter description"
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Image
              </label>
              <div className="mt-1 space-y-2">
                <input
                  ref={fileRefImage}
                  type="file"
                  accept="image/*"
                  onChange={onFile("image")}
                  className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
                  disabled={isSubmitting}
                />
                {imagePreview ? (
                  <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-2">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-16 w-16 rounded-md object-cover ring-1 ring-slate-200"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-xs font-semibold text-slate-700">
                        {form.image?.name || "Current image"}
                      </div>
                      <div className="mt-2">
                        <button
                          type="button"
                          onClick={() => handleRemoveFile("image")}
                          className="rounded-md bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700"
                          disabled={isSubmitting}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Video
              </label>
              <div className="mt-1 space-y-2">
                <input
                  ref={fileRefVideo}
                  type="file"
                  accept="video/*"
                  onChange={onFile("video")}
                  className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
                  disabled={isSubmitting}
                />
                {videoPreview ? (
                  <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-2">
                    <video
                      src={videoPreview}
                      controls
                      className="h-16 w-28 rounded-md bg-black ring-1 ring-slate-200"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-xs font-semibold text-slate-700">
                        {form.video?.name || "Current video"}
                      </div>
                      <div className="mt-2">
                        <button
                          type="button"
                          onClick={() => handleRemoveFile("video")}
                          className="rounded-md bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700"
                          disabled={isSubmitting}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            <div>
              <div className="text-sm font-medium text-slate-800">Active</div>
              <div className="text-xs text-slate-500">
                Toggle to publish/unpublish this item.
              </div>
            </div>
            <label className="inline-flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={onChange("isActive")}
                disabled={isSubmitting}
              />
              <span className="text-sm text-slate-700">
                {form.isActive ? "On" : "Off"}
              </span>
            </label>
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? mode === "edit"
                  ? "Updating..."
                  : "Adding..."
                : mode === "edit"
                  ? "Update"
                  : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Toggle = ({ checked, onChange, disabled }) => {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? "bg-emerald-500" : "bg-slate-300"
      } ${disabled ? "opacity-60" : ""}`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
          checked ? "translate-x-5" : "translate-x-1"
        }`}
      />
    </button>
  );
};

export const GalleryPage = () => {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 20,
  });

  const [videoModal, setVideoModal] = useState({
    open: false,
    src: "",
    title: "",
  });
  const [imageModal, setImageModal] = useState({
    open: false,
    src: "",
    title: "",
  });
  const [editModal, setEditModal] = useState({
    open: false,
    mode: "create",
    item: null,
  });

  const bannersEndpoint = useMemo(() => {
    return `${API_ENDPOINTS.BANNERS.GET_ALL}?page=${pagination.currentPage}&limit=${pagination.limit}`;
  }, [pagination.currentPage, pagination.limit]);

  const {
    data: bannersData,
    isLoading,
    error,
    refetch,
  } = useGetQuery(bannersEndpoint, [
    "banners",
    pagination.currentPage,
    pagination.limit,
  ]);

  const { data: categoriesData } = useGetQuery(
    `${API_ENDPOINTS.CATEGORIES.GET_ALL}?page=1&limit=1000&type=gallery`,
    ["categories", "all"],
  );

  const categories = useMemo(() => {
    const arr = categoriesData?.data?.data || categoriesData?.data || [];
    return Array.isArray(arr) ? arr : [];
  }, [categoriesData]);

  useEffect(() => {
    const paged = bannersData?.data;
    if (!paged) return;

    const rows = paged.data || [];
    setItems(rows);

    setPagination((prev) => ({
      ...prev,
      currentPage: paged.page || prev.currentPage,
      totalPages: paged.totalPages || prev.totalPages,
      totalItems: paged.total || prev.totalItems,
    }));
  }, [bannersData]);

  const { mutate: createBanner, isPending: isCreating } = usePostMutation(
    API_ENDPOINTS.BANNERS.CREATE,
  );

  const { mutate: deleteBanner, isPending: isDeleting } = useDeleteMutation(
    API_ENDPOINTS.BANNERS.DELETE,
  );

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const endpoint = API_ENDPOINTS.BANNERS.UPDATE.replace(":id", id);
      const res = await axiosInstance.put(endpoint, data);
      return res.data;
    },
  });

  const handleOpenCreate = () => {
    setEditModal({ open: true, mode: "create", item: null });
  };

  const handleOpenEdit = (row) => {
    setEditModal({ open: true, mode: "edit", item: row });
  };

  const handleDelete = (row) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    deleteBanner(row._id, {
      onSuccess: (res) => {
        toast.success(getApiMessage(res, "Deleted successfully"));
        refetch();
      },
    });
  };

  const handleSubmitCreate = (fd) => {
    createBanner(fd, {
      onSuccess: (res) => {
        toast.success(getApiMessage(res, "Created successfully"));
        setEditModal({ open: false, mode: "create", item: null });
        refetch();
      },
    });
  };

  const handleSubmitEdit = (fd) => {
    const id = editModal.item?._id;
    if (!id) return;

    updateMutation.mutate(
      { id, data: fd },
      {
        onSuccess: (res) => {
          toast.success(getApiMessage(res, "Updated successfully"));
          setEditModal({ open: false, mode: "create", item: null });
          refetch();
        },
      },
    );
  };

  const handleToggleActive = (row) => {
    const id = row?._id;
    if (!id) return;

    const fd = new FormData();
    fd.append("isActive", String(!row.isActive));

    updateMutation.mutate(
      { id, data: fd },
      {
        onSuccess: (res) => {
          toast.success(getApiMessage(res, "Status updated"));
          refetch();
        },
      },
    );
  };

  const columns = useMemo(() => {
    return [
      {
        key: "id",
        title: "Id",
        render: (row) => (
          <span className="text-xs text-slate-600">{row._id}</span>
        ),
      },
      {
        key: "image",
        title: "Image",
        render: (row) => (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setImageModal({
                  open: true,
                  src: row.image || "/images/default.png",
                  title: row.name,
                });
              }}
              className="rounded-md"
              title="View image"
            >
              <img
                src={row.image || "/images/default.png"}
                alt={row.name}
                className="h-12 w-12 rounded-md object-cover ring-1 ring-slate-200"
              />
            </button>
          </div>
        ),
      },
      {
        key: "name",
        title: "Name",
        render: (row) => (
          <span className="font-medium text-slate-800">{row.name || "-"}</span>
        ),
      },
      {
        key: "description",
        title: "Description",
        render: (row) => (
          <div className="max-w-[240px] truncate text-sm text-slate-600">
            {row.description || "-"}
          </div>
        ),
      },
      {
        key: "category",
        title: "Category",
        render: (row) => (
          <span className="text-sm text-slate-700">
            {row.category?.name || "-"}
          </span>
        ),
      },
      {
        key: "video",
        title: "Video",
        render: (row) => (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setVideoModal({ open: true, src: row.video, title: row.name });
            }}
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-2 py-1 text-slate-700 hover:bg-slate-50"
            title="View video"
          >
            <Eye size={18} />
          </button>
        ),
      },
      {
        key: "active",
        title: "Active",
        render: (row) => (
          <Toggle
            checked={!!row.isActive}
            onChange={(e) => {
              e?.stopPropagation?.();
              handleToggleActive(row);
            }}
            disabled={updateMutation.isPending}
          />
        ),
      },
    ];
  }, [updateMutation.isPending]);

  const pageBusy = isLoading;
  const mutationBusy = isCreating || isDeleting || updateMutation.isPending;

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, currentPage: newPage }));
  };

  const handleLimitChange = (newLimit) => {
    setPagination((prev) => ({ ...prev, limit: newLimit, currentPage: 1 }));
  };

  if (pageBusy) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader size={100} color="#3B82F6" className="text-center" />
      </div>
    );
  }

  const isNotFound = error?.response?.status === 404;
  const notFoundMessage = error?.response?.data?.message || "Not found";

  if (error) {
    if (isNotFound) {
      // Treat 404 as empty list state so the Create modal can still open.
      // We will render the NotFound component inside the normal page shell below.
    } else {
      return (
        <div className="rounded border border-red-200 bg-red-50 p-4">
          <h3 className="font-bold text-red-600">Something went wrong</h3>
          <p className="mt-1 text-sm text-red-700">{error.message}</p>
          <button
            onClick={() => refetch()}
            className="mt-3 rounded bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      );
    }
  }

  return (
    <div className="p-4">
      {isNotFound ? (
        <div className="mb-4">
          <NotFound
            title="No Gallery Items Found"
            type="gallery"
            message={notFoundMessage}
            actionText="Add New Item"
            onAction={handleOpenCreate}
          />
        </div>
      ) : null}

      {!isNotFound ? (
        <>
          <Table
            title="Gallery Management"
            addButtonText="Add Items"
            columns={columns}
            data={items}
            onAddNew={handleOpenCreate}
            onEdit={handleOpenEdit}
            onDelete={handleDelete}
          />

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-gray-600">
              Showing {items.length} of {pagination.totalItems} items
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label htmlFor="limit" className="text-sm font-medium">
                  Items per page:
                </label>
                <select
                  id="limit"
                  value={pagination.limit}
                  onChange={(e) => handleLimitChange(Number(e.target.value))}
                  className="rounded border px-2 py-1 text-sm"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          </div>
        </>
      ) : null}

      <VideoPreviewModal
        open={videoModal.open}
        src={videoModal.src}
        title={videoModal.title}
        onClose={() => setVideoModal({ open: false, src: "", title: "" })}
      />

      <ImagePreviewModal
        open={imageModal.open}
        src={imageModal.src}
        title={imageModal.title}
        onClose={() => setImageModal({ open: false, src: "", title: "" })}
      />

      <BannerAddEditModal
        open={editModal.open}
        mode={editModal.mode}
        initial={editModal.item}
        categories={categories}
        onClose={() =>
          setEditModal({ open: false, mode: "create", item: null })
        }
        onSubmit={
          editModal.mode === "edit" ? handleSubmitEdit : handleSubmitCreate
        }
        isSubmitting={mutationBusy}
      />
    </div>
  );
};
