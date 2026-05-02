import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";

import Loader from "../../components/UI/Loader";
import { useGetQuery, usePostMutation, usePutMutation } from "../../api/apiCall";
import API_ENDPOINTS from "../../api/apiEndpoint";

const getApiMessage = (res, fallback) => {
  return res?.message || res?.data?.message || fallback;
};

export const PrivaciesAddEdit = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    isActive: true,
  });

  const { data, isLoading: isFetching } = useGetQuery(
    isEditMode
      ? API_ENDPOINTS.PRIVACY_AND_POLICIES.GET_ONE.replace(":id", id)
      : null,
    {
      enabled: isEditMode,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      staleTime: 0,
    },
  );

  useEffect(() => {
    if (!isEditMode) return;
    const item = data?.data || data?.result || data;
    if (!item) return;

    setFormData({
      title: item.title || "",
      description: item.description || "",
      isActive: typeof item.isActive === "boolean" ? item.isActive : true,
    });
  }, [isEditMode, data]);

  const { mutate: createItem, isPending: isCreating } = usePostMutation(
    API_ENDPOINTS.PRIVACY_AND_POLICIES.CREATE,
  );

  const { mutate: updateItem, isPending: isUpdating } = usePutMutation(
    API_ENDPOINTS.PRIVACY_AND_POLICIES.UPDATE.replace(":id", id || ""),
  );

  const isSaving = isCreating || isUpdating;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      isActive: !!formData.isActive,
    };

    const onSuccess = (res) => {
      toast.success(
        getApiMessage(
          res,
          isEditMode
            ? "Privacy & policies updated successfully"
            : "Privacy & policies created successfully",
        ),
      );
      setTimeout(() => navigate("/privacies"), 700);
    };

    if (isEditMode) {
      updateItem(payload, { onSuccess });
      return;
    }

    createItem(payload, { onSuccess });
  };

  if (isEditMode && isFetching) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <Loader size={100} color="#3B82F6" />
          <p className="mt-4 text-gray-600">Loading privacy & policies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="bg-white shadow-lg rounded-lg p-6">
        <div className="flex justify-between items-center mb-6 pb-3 border-b">
          <h2 className="text-2xl font-bold text-gray-800">
            {isEditMode ? "Edit Privacy & Policies" : "Add Privacy & Policies"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col">
            <label htmlFor="title" className="mb-2 font-medium text-gray-700">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              placeholder="Enter title"
              value={formData.title}
              onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
              className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              required
              maxLength={120}
              disabled={isSaving}
            />
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
                setFormData((p) => ({ ...p, description: e.target.value }))
              }
              className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-vertical"
              rows={5}
              maxLength={300}
              disabled={isSaving}
            />
          </div>

          <div className="flex flex-col">
            <label className="block mb-2 font-medium text-gray-700">Status</label>
            <select
              value={String(!!formData.isActive)}
              onChange={(e) =>
                setFormData((p) => ({ ...p, isActive: e.target.value === "true" }))
              }
              className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              disabled={isSaving}
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50"
              disabled={isSaving || !formData.title.trim()}
            >
              {isSaving ? (isEditMode ? "Updating..." : "Adding...") : isEditMode ? "Update" : "Add"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/privacies")}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 px-6 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-gray-500 transition"
              disabled={isSaving}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
