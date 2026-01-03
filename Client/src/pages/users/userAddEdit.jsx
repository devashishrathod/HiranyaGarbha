import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  usePostMutation,
  useGetQuery,
  usePutMutation,
} from "../../api/apiCall";
import API_ENDPOINTS from "../../api/apiEndpoint";
import { toast } from "react-hot-toast";
import Loader from "../../components/UI/Loader";

export const UserAddEdit = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { mutate: addCategory, isLoading: isAdding } = usePostMutation(
    API_ENDPOINTS.CATEGORIES.CREATE,
    {
      onUploadProgress: (progressEvent) => {
        const progress = Math.round(
          (progressEvent.loaded * 100) / (progressEvent.total || 1)
        );
        setUploadProgress(progress);
      },
    }
  );

  const { mutate: updateCategory, isLoading: isUpdating } = usePutMutation(
    `${API_ENDPOINTS.CATEGORIES.UPDATE.replace(":id", id)}`,
    {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (progressEvent) => {
        const progress = Math.round(
          (progressEvent.loaded * 100) / (progressEvent.total || 1)
        );
        setUploadProgress(progress);
      },
    }
  );

  const { data: categoryData, isLoading: isFetchingCategory } = useGetQuery(
    isEditMode
      ? `${API_ENDPOINTS.CATEGORIES.GET_ONE.replace(":id", id)}`
      : null,
    {
      enabled: isEditMode,
      refetchOnWindowFocus: false,
    }
  );

  useEffect(() => {
    if (isEditMode && categoryData) {
      const category = categoryData.result || categoryData.data || categoryData;
      if (category) {
        setFormData({
          name: category.name || "",
          description: category.description || "",
        });
        if (category.image) {
          const imageUrl = category.image.startsWith("http")
            ? category.image
            : `${process.env.REACT_APP_API_BASE_URL || ""}${category.image}`;
          setPreviewImage(imageUrl);
        }
      } else {
        toast.error("Failed to load category data");
      }
    }
  }, [isEditMode, categoryData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Title is required");
      return;
    }
    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name.trim());
    formDataToSend.append("description", formData.description.trim());
    if (formData.image) {
      formDataToSend.append("image", formData.image);
    }
    setUploadProgress(0);
    const onSuccess = (response) => {
      console.log("Success response:", response);
      setFormData({ name: "", description: "", image: "" });
      setPreviewImage(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setUploadProgress(0);
      toast.success(
        isEditMode
          ? "Category updated successfully!"
          : "Category added successfully!"
      );
      setTimeout(() => navigate("/category"), 1000);
    };
    const onError = (error) => {
      console.error("API Error:", error);
      const errorMessage =
        error.response?.data?.message || error.message || "Operation failed";
      toast.error(errorMessage);
      setUploadProgress(0);
    };
    try {
      if (isEditMode) {
        updateCategory(formDataToSend, { onSuccess, onError });
      } else {
        addCategory(formDataToSend, { onSuccess, onError });
      }
    } catch (error) {
      console.error("Submission Error:", error);
      toast.error("An unexpected error occurred");
      setUploadProgress(0);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setFormData({ ...formData, image: "" });
      setPreviewImage(null);
      return;
    }

    setFormData({ ...formData, image: file });
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
    setFormData({ ...formData, image: "" });
    setPreviewImage(null);
    toast.info("Image removed");
  };

  useEffect(() => {
    return () => {
      if (previewImage && previewImage.startsWith("blob:")) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);

  if (isEditMode && isFetchingCategory) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <Loader size={100} color="#3B82F6" />
          <p className="mt-4 text-gray-600">Loading category data...</p>
        </div>
      </div>
    );
  }

  const isLoading = isAdding || isUpdating;

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="bg-white shadow-lg rounded-lg p-6">
        <div className="flex justify-between items-center mb-6 pb-3 border-b">
          <h2 className="text-2xl font-bold text-gray-800">
            {isEditMode ? "Edit Category" : "Add New Category"}
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="flex flex-col">
            <label htmlFor="name" className="mb-2 font-medium text-gray-700">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              placeholder="Enter category name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              required
              maxLength={100}
            />
            <span className="text-xs text-gray-500 mt-1">
              {formData.name.length}/100 characters
            </span>
          </div>
          {/* Description */}
          <div className="flex flex-col">
            <label
              htmlFor="description"
              className="mb-2 font-medium text-gray-700"
            >
              Description
            </label>
            <textarea
              id="description"
              placeholder="Enter category description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-vertical"
              rows="4"
              maxLength={500}
            />
            <span className="text-xs text-gray-500 mt-1">
              {formData.description.length}/500 characters
            </span>
          </div>
          {/* Image Upload */}
          <div className="flex flex-col">
            <label className="block mb-2 font-medium text-gray-700">
              Category Image
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
              />
              <span className="px-3 text-sm text-gray-700 truncate flex-1">
                {formData.image?.name ||
                  (isEditMode && !formData.image
                    ? "Current image will be kept"
                    : "No file selected")}
              </span>
            </div>
            {isLoading && uploadProgress > 0 && (
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-3">
                <div
                  className="bg-green-600 h-2.5 rounded-full transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
                <p className="text-xs text-gray-600 mt-1 text-center">
                  Uploading... {uploadProgress}%
                </p>
              </div>
            )}
            {previewImage && (
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm font-medium text-gray-700">Preview:</p>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="text-red-500 hover:text-red-700 text-sm font-medium transition"
                  >
                    Remove Image
                  </button>
                </div>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex justify-center bg-gray-50">
                  <img
                    src={previewImage}
                    alt="Category preview"
                    className="max-h-48 w-auto object-contain rounded border"
                  />
                </div>
                {isEditMode && !formData.image && (
                  <p className="text-xs text-gray-500 mt-1 text-center">
                    Current image
                  </p>
                )}
              </div>
            )}
          </div>
          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50"
              disabled={isLoading || !formData.name.trim()}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {isEditMode ? "Updating..." : "Adding..."}
                </span>
              ) : isEditMode ? (
                "Update Category"
              ) : (
                "Add Category"
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate("/category")}
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
