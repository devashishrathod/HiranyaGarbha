import API_ENDPOINTS from "../../api/apiEndpoint";
import { useGetQuery } from "../../api/apiCall";
import Loader from "../../components/UI/Loader";
import formatGrammer from "../../utils/formatGrammer";
import { TRIMESTER_LABELS, formatPrice } from "../../constants/subscription";

const Field = ({ label, children }) => (
  <div>
    <h3 className="text-sm font-medium text-gray-500">{label}</h3>
    <div className="mt-1 text-gray-800">{children}</div>
  </div>
);

const BulletList = ({ items }) => {
  if (!items?.length) return <span className="text-sm text-gray-500">-</span>;

  return (
    <ul className="list-disc pl-5 space-y-1 text-sm">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
};

export const SubscriptionView = ({ subscriptionId, onClose }) => {
  const endpoint = subscriptionId
    ? API_ENDPOINTS.SUBSCRIPTIONS.GET_ONE.replace(":id", subscriptionId)
    : null;

  const { data, isLoading } = useGetQuery(endpoint, [
    "subscription",
    subscriptionId,
  ]);

  const item = data?.data || data?.result || data;

  const premiumGroups = Object.entries(item?.premiumFeatures || {}).filter(
    ([key, features]) =>
      key !== "_id" && Array.isArray(features) && features.length,
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Package Details</h2>
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
        ) : item?._id ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Name">{item.name || "-"}</Field>
              <Field label="Tier">{formatGrammer(item.tier) || "-"}</Field>
              <Field label="Subtitle">{item.subtitle || "-"}</Field>
              <Field label="Badge">{item.badge || "-"}</Field>
              <Field label="Duration">{item.duration || "-"}</Field>
              <Field label="Ideal For">{item.idealFor || "-"}</Field>
              <Field label="Starting Price">{formatPrice(item.price)}</Field>
              <Field label="Status">
                {item?.isActive ? "Active" : "Inactive"}
              </Field>
            </div>

            <Field label="Trimester Plans">
              {item.plans?.length ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500">
                        <th className="py-1 pr-4 font-medium">Trimester</th>
                        <th className="py-1 pr-4 font-medium">Price</th>
                        <th className="py-1 pr-4 font-medium">Cut Price</th>
                        <th className="py-1 pr-4 font-medium">Days</th>
                        <th className="py-1 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {item.plans.map((plan) => (
                        <tr key={plan.trimester} className="border-t">
                          <td className="py-1 pr-4">
                            {TRIMESTER_LABELS[plan.trimester] ||
                              plan.trimester}
                          </td>
                          <td className="py-1 pr-4 font-medium">
                            {formatPrice(plan.price)}
                          </td>
                          <td className="py-1 pr-4 text-gray-500">
                            {typeof plan.originalPrice === "number"
                              ? formatPrice(plan.originalPrice)
                              : "-"}
                          </td>
                          <td className="py-1 pr-4">
                            {plan.durationInDays ?? "-"}
                          </td>
                          <td className="py-1">
                            {plan.isActive === false ? "Inactive" : "Active"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <span className="text-sm text-gray-500">-</span>
              )}
            </Field>

            <Field label={`Course Modules (${item.modules?.length || 0})`}>
              <BulletList items={item.modules} />
            </Field>

            <Field label={`Includes (${item.includes?.length || 0})`}>
              <BulletList items={item.includes} />
            </Field>

            {item.exclusiveBenefits?.length ? (
              <Field label="Exclusive Benefits">
                <BulletList items={item.exclusiveBenefits} />
              </Field>
            ) : null}

            {premiumGroups.length ? (
              <Field label="Premium Features">
                <div className="space-y-3">
                  {premiumGroups.map(([category, features]) => (
                    <div key={category}>
                      <p className="text-sm font-medium text-gray-700 capitalize">
                        {category.replace(/([A-Z])/g, " $1").trim()}
                      </p>
                      <BulletList items={features} />
                    </div>
                  ))}
                </div>
              </Field>
            ) : null}

            <Field label="Description">
              {item.description || "No description provided"}
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Created At">
                {item?.createdAt
                  ? new Date(item.createdAt).toLocaleString()
                  : "N/A"}
              </Field>
              <Field label="Updated At">
                {item?.updatedAt
                  ? new Date(item.updatedAt).toLocaleString()
                  : "N/A"}
              </Field>
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
