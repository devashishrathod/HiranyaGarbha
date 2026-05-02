import API_ENDPOINTS from "../../api/apiEndpoint";
import { useGetQuery } from "../../api/apiCall";
import Loader from "../../components/UI/Loader";
import formatGrammer from "../../utils/formatGrammer";

export const SubscriptionView = ({ subscriptionId, onClose }) => {
  const endpoint = subscriptionId
    ? API_ENDPOINTS.SUBSCRIPTIONS.GET_ONE.replace(":id", subscriptionId)
    : null;

  const { data, isLoading } = useGetQuery(endpoint, [
    "subscription",
    subscriptionId,
  ]);

  const item = data?.data || data?.result || data;

  return (
    <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Subscription Details</h2>
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
        ) : item ? (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Name</h3>
              <p className="mt-1">{formatGrammer(item.name) || "-"}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Type</h3>
              <p className="mt-1">{formatGrammer(item.type) || "-"}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Price</h3>
              <p className="mt-1">
                {typeof item.price === "number" ? item.price : "-"}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Duration</h3>
              <p className="mt-1">
                {typeof item.durationInDays === "number"
                  ? `${item.durationInDays} days`
                  : "-"}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Status</h3>
              <p className="mt-1">{item?.isActive ? "Active" : "Inactive"}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Benefits</h3>
              <div className="mt-1 text-sm text-gray-800">
                {Array.isArray(item?.benefits) && item.benefits.length
                  ? item.benefits.join(", ")
                  : "-"}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Limitations</h3>
              <div className="mt-1 text-sm text-gray-800">
                {Array.isArray(item?.limitations) && item.limitations.length
                  ? item.limitations.join(", ")
                  : "-"}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Description</h3>
              <p className="mt-1">
                {formatGrammer(item.description) || "No description provided"}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Created At</h3>
              <p className="mt-1">
                {item?.createdAt
                  ? new Date(item.createdAt).toLocaleString()
                  : "N/A"}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Updated At</h3>
              <p className="mt-1">
                {item?.updatedAt
                  ? new Date(item.updatedAt).toLocaleString()
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
