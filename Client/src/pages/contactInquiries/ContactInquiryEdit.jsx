import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

import { usePutMutation } from "../../api/apiCall";
import API_ENDPOINTS from "../../api/apiEndpoint";
import formatGrammer from "../../utils/formatGrammer";

const getApiMessage = (res, fallback) => {
  return res?.message || res?.data?.message || fallback;
};

export const ContactInquiryEdit = ({ inquiry, onClose, onSaved }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    city: "",
    message: "",
  });

  useEffect(() => {
    if (!inquiry) return;
    setFormData({
      name: inquiry?.name || "",
      email: inquiry?.email || "",
      mobile: inquiry?.mobile || "",
      city: inquiry?.city || "",
      message: inquiry?.message || "",
    });
  }, [inquiry]);

  const endpoint = inquiry?._id
    ? API_ENDPOINTS.CONTACT_US.UPDATE.replace(":id", inquiry._id)
    : null;

  const { mutate: updateInquiry, isPending } = usePutMutation(endpoint, {
    toastOnError: true,
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!inquiry?._id) {
      toast.error("Invalid inquiry");
      return;
    }

    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (!formData.email.trim()) {
      toast.error("Email is required");
      return;
    }

    if (!String(formData.mobile || "").trim()) {
      toast.error("Mobile is required");
      return;
    }

    if (!formData.city.trim()) {
      toast.error("City is required");
      return;
    }

    if (!formData.message.trim()) {
      toast.error("Message is required");
      return;
    }

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      mobile: formData.mobile,
      city: formData.city.trim(),
      message: formData.message.trim(),
    };

    updateInquiry(payload, {
      onSuccess: (res) => {
        toast.success(getApiMessage(res, "Inquiry updated successfully"));
        onSaved?.();
      },
    });
  };

  if (!inquiry) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Edit Contact Inquiry</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Name</label>
            <input
              value={formData.name}
              onChange={(e) =>
                setFormData((p) => ({ ...p, name: e.target.value }))
              }
              className="mt-1 w-full border rounded px-3 py-2 text-sm"
              placeholder="Name"
              disabled={isPending}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              value={formData.email}
              onChange={(e) =>
                setFormData((p) => ({ ...p, email: e.target.value }))
              }
              className="mt-1 w-full border rounded px-3 py-2 text-sm"
              placeholder="Email"
              disabled={isPending}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Mobile</label>
            <input
              value={formData.mobile}
              onChange={(e) =>
                setFormData((p) => ({ ...p, mobile: e.target.value }))
              }
              className="mt-1 w-full border rounded px-3 py-2 text-sm"
              placeholder="Mobile"
              disabled={isPending}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">City</label>
            <input
              value={formData.city}
              onChange={(e) =>
                setFormData((p) => ({ ...p, city: e.target.value }))
              }
              className="mt-1 w-full border rounded px-3 py-2 text-sm"
              placeholder="City"
              disabled={isPending}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Message</label>
            <textarea
              value={formData.message}
              onChange={(e) =>
                setFormData((p) => ({ ...p, message: e.target.value }))
              }
              className="mt-1 w-full border rounded px-3 py-2 text-sm"
              placeholder="Message"
              rows={4}
              disabled={isPending}
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-sm disabled:opacity-50"
              disabled={isPending}
            >
              {isPending ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 hover:bg-gray-50 py-2 px-4 rounded text-sm"
              disabled={isPending}
            >
              Cancel
            </button>
          </div>

          <div className="text-xs text-gray-500">
            Preview name: {formatGrammer(formData.name) || "-"}
          </div>
        </form>
      </div>
    </div>
  );
};
