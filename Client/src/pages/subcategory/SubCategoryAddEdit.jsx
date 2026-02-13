import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";

import Loader from "../../components/UI/Loader";
import { useGetQuery, usePutMutation } from "../../api/apiCall";
import API_ENDPOINTS from "../../api/apiEndpoint";
import axiosInstance from "../../api/axiosInstance";

const getApiMessage = (res, fallback) => {
  return res?.message || res?.data?.message || fallback;
};

export const SubCategoryAddEdit = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();

  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    categoryId: "",
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [removeExistingImage, setRemoveExistingImage] = useState(false);

  const { data: categoriesData } = useGetQuery(
    `${API_ENDPOINTS.CATEGORIES.GET_ALL}?page=1&limit=1000`,
    ["categories", "all"],
  );

  const categories = useMemo(() => {
    const arr = categoriesData?.data?.data || categoriesData?.data || [];
    return Array.isArray(arr) ? arr : [];
  }, [categoriesData]);

  const createMutation = useMutation({
    mutationFn: async ({ categoryId, data }) => {
      const endpoint = API_ENDPOINTS.SUBCATEGORIES.CREATE.replace(
        ":categoryId",
        categoryId,
      );
      const response = await axiosInstance.post(endpoint, data, {
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1),
          );
          setUploadProgress(progress);
        },
      });
      return response.data;
    },
  });

  const { mutate: updateSubCategory, isPending: isUpdating } = usePutMutation(
    API_ENDPOINTS.SUBCATEGORIES.UPDATE.replace(":id", id || ""),
    {
      onUploadProgress: (progressEvent) => {
        const progress = Math.round(
          (progressEvent.loaded * 100) / (progressEvent.total || 1),
        );
        setUploadProgress(progress);
      },
      toastOnError: false,
    },
  );

  const { data: subCategoryData, isLoading: isFetching } = useGetQuery(
    isEditMode ? API_ENDPOINTS.SUBCATEGORIES.GET_ONE.replace(":id", id) : null,
    {
      enabled: isEditMode,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      staleTime: 0,
    },
  );

  useEffect(() => {
    if (!isEditMode) return;
    if (!subCategoryData) return;

    const sub =
      subCategoryData?.data || subCategoryData?.result || subCategoryData;
    if (!sub) return;

    setFormData({
      name: sub.name || "",
      description: sub.description || "",
      categoryId: sub.categoryId || "",
    });

    if (sub.image) setPreviewImage(sub.image);
    else setPreviewImage(null);
    setRemoveExistingImage(false);
  }, [isEditMode, subCategoryData]);

  useEffect(() => {
    return () => {
      if (previewImage && previewImage.startsWith("blob:")) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);

  const isLoading = createMutation.isPending || isUpdating;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setFormData((prev) => ({ ...prev, image: "" }));
      setPreviewImage(null);
      return;
    }

    setFormData((prev) => ({ ...prev, image: file }));
    if (previewImage && previewImage.startsWith("blob:")) {
      URL.revokeObjectURL(previewImage);
    }
    setPreviewImage(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (previewImage && previewImage.startsWith("blob:")) {
      URL.revokeObjectURL(previewImage);
    }
    setFormData((prev) => ({ ...prev, image: "" }));
    setPreviewImage(null);
    if (isEditMode) setRemoveExistingImage(true);
    toast.info("Image removed");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (!formData.categoryId) {
      toast.error("Category is required");
      return;
    }

    const fd = new FormData();
    fd.append("name", formData.name.trim());
    fd.append("description", formData.description.trim());
    if (formData.image) fd.append("image", formData.image);
    if (isEditMode && removeExistingImage && !formData.image) {
      fd.append("removeImage", "true");
    }

    setUploadProgress(0);

    const onSuccess = (res) => {
      toast.success(
        getApiMessage(
          res,
          isEditMode
            ? "Subcategory updated successfully"
            : "Subcategory created successfully",
        ),
      );
      setTimeout(() => navigate("/subcategories"), 700);
    };

    const onError = (err) => {
      const msg =
        err?.response?.data?.message || err?.message || "Operation failed";
      toast.error(msg);
      setUploadProgress(0);
    };

    if (isEditMode) {
      updateSubCategory(fd, { onSuccess, onError });
      return;
    }

    createMutation.mutate(
      { categoryId: formData.categoryId, data: fd },
      { onSuccess, onError },
    );
  };

  if (isEditMode && isFetching) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <Loader size={100} color="#3B82F6" />
          <p className="mt-4 text-gray-600">Loading subcategory data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="bg-white shadow-lg rounded-lg p-6">
        <div className="flex justify-between items-center mb-6 pb-3 border-b">
          <h2 className="text-2xl font-bold text-gray-800">
            {isEditMode ? "Edit Subcategory" : "Add New Subcategory"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col">
            <label htmlFor="name" className="mb-2 font-medium text-gray-700">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              placeholder="Enter subcategory name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              required
              maxLength={100}
              disabled={isLoading}
            />
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="categoryId"
              className="mb-2 font-medium text-gray-700"
            >
              Category <span className="text-red-500">*</span>
            </label>
            <select
              id="categoryId"
              value={formData.categoryId}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, categoryId: e.target.value }))
              }
              className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              required
              disabled={isLoading}
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="description"
              className="mb-2 font-medium text-gray-700"
            >
              Description
            </label>
            <textarea
              id="description"
              placeholder="Enter description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-vertical"
              rows="4"
              maxLength={500}
              disabled={isLoading}
            />
          </div>

          <div className="flex flex-col">
            <label className="block mb-2 font-medium text-gray-700">
              Image
            </label>
            <div className="flex w-full rounded-lg overflow-hidden border border-gray-300 items-center">
              <label
                htmlFor="image-upload"
                className="bg-gray-800 text-white px-4 py-3 cursor-pointer text-sm hover:bg-gray-700 transition"
              >
                Choose Image
              </label>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
                ref={fileInputRef}
                disabled={isLoading}
              />
              <span className="px-3 text-sm text-gray-700 truncate flex-1">
                {formData.image?.name ||
                  (isEditMode && !formData.image
                    ? "Current image will be kept"
                    : "No file selected")}
              </span>
            </div>

            {isLoading && uploadProgress > 0 ? (
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-3">
                <div
                  className="bg-green-600 h-2.5 rounded-full transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
                <p className="text-xs text-gray-600 mt-1 text-center">
                  Uploading... {uploadProgress}%
                </p>
              </div>
            ) : null}

            {previewImage ? (
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm font-medium text-gray-700">Preview:</p>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="text-red-500 hover:text-red-700 text-sm font-medium transition"
                    disabled={isLoading}
                  >
                    Remove Image
                  </button>
                </div>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex justify-center bg-gray-50">
                  <img
                    src={previewImage}
                    alt="Subcategory preview"
                    className="max-h-48 w-auto object-contain rounded border"
                  />
                </div>
              </div>
            ) : null}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50"
              disabled={isLoading || !formData.name.trim()}
            >
              {isLoading
                ? isEditMode
                  ? "Updating..."
                  : "Adding..."
                : isEditMode
                  ? "Update Subcategory"
                  : "Add Subcategory"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/subcategories")}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 px-6 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-gray-500 transition"
              disabled={isLoading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
