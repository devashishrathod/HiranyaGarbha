import formatGrammer from "../../utils/formatGrammer";
import Loader from "../../components/UI/Loader";
import { useGetQuery } from "../../api/apiCall";
import API_ENDPOINTS from "../../api/apiEndpoint";

export const ContactInquiryView = ({ inquiryId, onClose }) => {
  const endpoint = inquiryId
    ? API_ENDPOINTS.CONTACT_US.GET_ONE.replace(":id", inquiryId)
    : null;

  const { data, isLoading } = useGetQuery(endpoint, [
    "contactInquiry",
    inquiryId,
  ]);

  const inquiry = data?.data || data?.result || data;

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Contact Inquiry Details</h2>
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

        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <Loader size={70} color="#3B82F6" />
          </div>
        ) : inquiry ? (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Name</h3>
              <p className="mt-1">{formatGrammer(inquiry?.name) || "-"}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Email</h3>
              <p className="mt-1">{inquiry?.email || "-"}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Mobile</h3>
              <p className="mt-1">{inquiry?.mobile || "-"}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">City</h3>
              <p className="mt-1">{formatGrammer(inquiry?.city) || "-"}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Permission to Contact
              </h3>
              <p className="mt-1">
                {inquiry?.isPermissionGiven ? "Given" : "Not given"}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Message</h3>
              <p className="mt-1">{formatGrammer(inquiry?.message) || "-"}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Created At</h3>
              <p className="mt-1">
                {inquiry?.createdAt
                  ? new Date(inquiry.createdAt).toLocaleString()
                  : "N/A"}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Updated At</h3>
              <p className="mt-1">
                {inquiry?.updatedAt
                  ? new Date(inquiry.updatedAt).toLocaleString()
                  : "N/A"}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-600">No details available.</div>
        )}

        <div className="mt-6">
          <button
            onClick={onClose}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
