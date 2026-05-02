import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

import {
  usePostMutation,
  useGetQuery,
  usePutMutation,
} from "../../api/apiCall";
import API_ENDPOINTS from "../../api/apiEndpoint";
import Loader from "../../components/UI/Loader";

export const SubscriptionAddEdit = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    type: "monthly",
    benefits: "",
    limitations: "",
    isActive: true,
  });

  const { mutate: addSubscription, isPending: isAdding } = usePostMutation(
    API_ENDPOINTS.SUBSCRIPTIONS.CREATE,
  );

  const { mutate: updateSubscription, isPending: isUpdating } = usePutMutation(
    API_ENDPOINTS.SUBSCRIPTIONS.UPDATE.replace(":id", id || ""),
  );

  const { data: subscriptionData, isLoading: isFetching } = useGetQuery(
    isEditMode ? API_ENDPOINTS.SUBSCRIPTIONS.GET_ONE.replace(":id", id) : null,
    {
      enabled: isEditMode,
      refetchOnWindowFocus: false,
    },
  );

  useEffect(() => {
    if (!isEditMode) return;
    const item = subscriptionData?.data || subscriptionData?.result || subscriptionData;
    if (!item) return;

    setFormData({
      name: item.name || "",
      description: item.description || "",
      price: typeof item.price === "number" ? String(item.price) : "",
      type: item.type || "monthly",
      benefits: Array.isArray(item.benefits) ? item.benefits.join(", ") : "",
      limitations: Array.isArray(item.limitations)
        ? item.limitations.join(", ")
        : "",
      isActive: typeof item.isActive === "boolean" ? item.isActive : true,
    });
  }, [isEditMode, subscriptionData]);

  const isLoading = isAdding || isUpdating;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    const priceNum = Number(formData.price);
    if (!Number.isFinite(priceNum) || priceNum < 0) {
      toast.error("Price must be a valid number");
      return;
    }

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: priceNum,
      type: formData.type,
      benefits: formData.benefits
        ? formData.benefits
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
      limitations: formData.limitations
        ? formData.limitations
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
      isActive: !!formData.isActive,
    };

    const onSuccess = (res) => {
      toast.success(res?.message || (isEditMode ? "Updated" : "Created"));
      setTimeout(() => navigate("/subscriptions"), 800);
    };

    const onError = (error) => {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Operation failed";
      toast.error(msg);
    };

    if (isEditMode) {
      updateSubscription(payload, { onSuccess, onError });
    } else {
      addSubscription(payload, { onSuccess, onError });
    }
  };

  if (isEditMode && isFetching) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <Loader size={100} color="#3B82F6" />
          <p className="mt-4 text-gray-600">Loading subscription...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="bg-white shadow-lg rounded-lg p-6">
        <div className="flex justify-between items-center mb-6 pb-3 border-b">
          <h2 className="text-2xl font-bold text-gray-800">
            {isEditMode ? "Edit Subscription" : "Add Subscription"}
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
              placeholder="Enter subscription name"
              value={formData.name}
              onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
              className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              required
              maxLength={120}
              disabled={isLoading}
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="description" className="mb-2 font-medium text-gray-700">
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
              rows="4"
              maxLength={500}
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label htmlFor="price" className="mb-2 font-medium text-gray-700">
                Price <span className="text-red-500">*</span>
              </label>
              <input
                id="price"
                type="number"
                min="0"
                step="0.01"
                placeholder="0"
                value={formData.price}
                onChange={(e) => setFormData((p) => ({ ...p, price: e.target.value }))}
                className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                required
                disabled={isLoading}
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="type" className="mb-2 font-medium text-gray-700">
                Type
              </label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => setFormData((p) => ({ ...p, type: e.target.value }))}
                className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                disabled={isLoading}
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="half_yearly">Half Yearly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col">
            <label htmlFor="benefits" className="mb-2 font-medium text-gray-700">
              Benefits (comma separated)
            </label>
            <input
              id="benefits"
              type="text"
              placeholder="Benefit 1, Benefit 2"
              value={formData.benefits}
              onChange={(e) =>
                setFormData((p) => ({ ...p, benefits: e.target.value }))
              }
              className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              disabled={isLoading}
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="limitations" className="mb-2 font-medium text-gray-700">
              Limitations (comma separated)
            </label>
            <input
              id="limitations"
              type="text"
              placeholder="Limit 1, Limit 2"
              value={formData.limitations}
              onChange={(e) =>
                setFormData((p) => ({ ...p, limitations: e.target.value }))
              }
              className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              disabled={isLoading}
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
              disabled={isLoading}
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50"
              disabled={isLoading || !formData.name.trim()}
            >
              {isLoading ? (isEditMode ? "Updating..." : "Adding...") : isEditMode ? "Update Subscription" : "Add Subscription"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/subscriptions")}
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
