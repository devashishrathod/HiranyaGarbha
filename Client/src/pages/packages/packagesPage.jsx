import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

import { useDeleteMutation, useGetQuery } from "../../api/apiCall";
import API_ENDPOINTS from "../../api/apiEndpoint";
import Loader from "../../components/UI/Loader";
import NotFound from "../../components/UI/NotFound";
import {
  PLAN_TRIMESTERS,
  TRIMESTER_LABELS,
  TRIMESTER_TABS,
  formatPrice,
  getTierTheme,
} from "../../constants/subscription";

/* A package saved from the panel always carries the premium-feature groups,
   so emptiness is what decides whether the section renders, not presence. */
const premiumGroupsWithItems = (premiumFeatures) =>
  Object.entries(premiumFeatures || {}).filter(
    ([, features]) => Array.isArray(features) && features.length,
  );

const CheckIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 13l4 4L19 7"
    />
  </svg>
);

const ClockIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const UserIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  </svg>
);

/* Price block shared by the card header and the detail modal */
const PriceTag = ({ plan, size = "card" }) => {
  if (!plan) return null;

  const priceClass = size === "modal" ? "text-4xl" : "text-3xl";
  const originalClass = size === "modal" ? "text-xl" : "text-sm";

  return (
    <div className="flex items-baseline space-x-2">
      <span className={`${priceClass} font-bold`}>
        {formatPrice(plan.price)}
      </span>
      {typeof plan.originalPrice === "number" && plan.originalPrice > 0 ? (
        <span className={`${originalClass} line-through opacity-75`}>
          {formatPrice(plan.originalPrice)}
        </span>
      ) : null}
    </div>
  );
};

const PackagesPage = () => {
  const [trimester, setTrimester] = useState(PLAN_TRIMESTERS.FIRST);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const navigate = useNavigate();

  const endpoint = `${API_ENDPOINTS.SUBSCRIPTIONS.GET_PACKAGES}?trimester=${trimester}`;

  const {
    data: packagesData,
    isLoading,
    error,
    refetch,
  } = useGetQuery(endpoint, ["packages", trimester]);

  const { mutate: deletePackage, isPending: isDeleting } = useDeleteMutation(
    API_ENDPOINTS.SUBSCRIPTIONS.DELETE,
  );

  const packages = useMemo(
    () => packagesData?.data?.packages || [],
    [packagesData],
  );
  const bonusCourses = useMemo(
    () => packagesData?.data?.bonusCourses || [],
    [packagesData],
  );

  const handleAddNew = () => navigate("/subscriptions/add");
  const handleEdit = (pkg) => navigate(`/subscriptions/update/${pkg._id}`);

  const handleDelete = (pkg) => {
    if (!window.confirm(`Delete "${pkg.name}"?`)) return;

    deletePackage(pkg._id, {
      onSuccess: (res) => {
        toast.success(res?.message || "Package deleted successfully!");
        setSelectedPackage(null);
        refetch();
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader size={100} color="#3B82F6" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 p-4 rounded border border-red-300 m-6">
        <h3 className="text-red-500 font-bold">Something went wrong</h3>
        <p>{error?.response?.data?.message || error.message}</p>
        <button
          onClick={() => refetch()}
          className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-6 mb-10 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Pregnancy Care Packages
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl">
              Choose the perfect package for your pregnancy journey. From
              foundational basics to complete conscious parenting.
            </p>
          </div>
          <button
            onClick={handleAddNew}
            className="shrink-0 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-150"
          >
            + Add New Package
          </button>
        </div>

        {/* Trimester selector - pricing changes with how much journey is left */}
        <div className="mb-10">
          <p className="text-sm font-medium text-gray-600 mb-3">
            Pricing for mothers joining in
          </p>
          <div className="inline-flex flex-wrap gap-2 p-1 bg-gray-100 rounded-xl">
            {TRIMESTER_TABS.map((value) => (
              <button
                key={value}
                onClick={() => setTrimester(value)}
                className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  trimester === value
                    ? "bg-white text-purple-700 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                {TRIMESTER_LABELS[value]}
              </button>
            ))}
          </div>
        </div>

        {!packages.length ? (
          <NotFound
            title="No Packages Found"
            type="default"
            message="No active packages yet. Create one to get started."
            actionText="Create New Package"
            onAction={handleAddNew}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {packages.map((pkg) => {
              const theme = getTierTheme(pkg);
              const plan = pkg.selectedPlan;

              return (
                <div
                  key={pkg._id}
                  className={`relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl ${
                    pkg.isPopular
                      ? "ring-2 ring-purple-500 transform scale-105"
                      : ""
                  }`}
                >
                  {pkg.badge && (
                    <div
                      className={`absolute top-0 right-0 px-4 py-1 bg-gradient-to-r ${theme.color} text-white text-sm font-semibold`}
                    >
                      {pkg.badge}
                    </div>
                  )}

                  {/* Header */}
                  <div
                    className={`bg-gradient-to-r ${theme.color} p-6 text-white`}
                  >
                    <h2 className="text-2xl font-bold mb-1">{pkg.name}</h2>
                    <p className="text-sm opacity-90 mb-2">{pkg.subtitle}</p>
                    <PriceTag plan={plan} />
                    {plan?.trimester && plan.trimester !== trimester ? (
                      <p className="mt-1 text-xs opacity-90">
                        Same price in every trimester
                      </p>
                    ) : null}
                  </div>

                  {/* Body */}
                  <div className="p-6">
                    <div className="mb-4">
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <ClockIcon className="w-4 h-4 mr-2" />
                        <span>Duration: {pkg.duration || "-"}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <UserIcon className="w-4 h-4 mr-2" />
                        <span>{pkg.idealFor || "-"}</span>
                      </div>
                    </div>

                    {/* Modules */}
                    {pkg.modules?.length ? (
                      <div className="mb-4">
                        <h3 className="font-semibold text-gray-800 mb-3">
                          Course Modules ({pkg.modules.length})
                        </h3>
                        <ul className="space-y-2">
                          {pkg.modules.slice(0, 6).map((module, index) => (
                            <li
                              key={index}
                              className="flex items-start text-sm text-gray-600"
                            >
                              <CheckIcon className="w-4 h-4 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                              {module}
                            </li>
                          ))}
                          {pkg.modules.length > 6 && (
                            <li className="text-sm text-gray-500 italic">
                              +{pkg.modules.length - 6} more modules
                            </li>
                          )}
                        </ul>
                      </div>
                    ) : null}

                    {/* Includes */}
                    {pkg.includes?.length ? (
                      <div className="mb-6">
                        <h3 className="font-semibold text-gray-800 mb-3">
                          Includes
                        </h3>
                        <ul className="space-y-2">
                          {pkg.includes.slice(0, 4).map((item, index) => (
                            <li
                              key={index}
                              className="flex items-start text-sm text-gray-600"
                            >
                              <CheckIcon className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                              {item}
                            </li>
                          ))}
                          {pkg.includes.length > 4 && (
                            <li className="text-sm text-gray-500 italic">
                              +{pkg.includes.length - 4} more features
                            </li>
                          )}
                        </ul>
                      </div>
                    ) : null}

                    {/* All trimester prices at a glance */}
                    {pkg.plans?.length > 1 ? (
                      <div className="mb-6 rounded-lg border border-gray-200 divide-y divide-gray-100">
                        {pkg.plans.map((item) => (
                          <div
                            key={item.trimester}
                            className={`flex items-center justify-between px-3 py-2 text-sm ${
                              item.trimester === trimester
                                ? "bg-gray-50 font-semibold text-gray-800"
                                : "text-gray-600"
                            }`}
                          >
                            <span>
                              {TRIMESTER_LABELS[item.trimester] ||
                                item.trimester}
                            </span>
                            <span>{formatPrice(item.price)}</span>
                          </div>
                        ))}
                      </div>
                    ) : null}

                    {/* Premium Features for Elite */}
                    {pkg.premiumFeatures?.medicalCare?.length ? (
                      <div className="mb-6 p-4 bg-amber-50 rounded-lg">
                        <h3 className="font-semibold mb-3 text-amber-800">
                          Premium Features
                        </h3>
                        <div className="space-y-3 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">
                              Medical Care:
                            </span>
                            <ul className="mt-1 space-y-1 text-gray-600">
                              {pkg.premiumFeatures.medicalCare.map(
                                (item, index) => (
                                  <li key={index} className="flex items-start">
                                    <CheckIcon className="w-3 h-3 mr-2 text-amber-500 flex-shrink-0 mt-0.5" />
                                    {item}
                                  </li>
                                ),
                              )}
                            </ul>
                          </div>
                          {pkg.premiumFeatures.afterDelivery?.length ? (
                            <div>
                              <span className="font-medium text-gray-700">
                                After Delivery:
                              </span>
                              <ul className="mt-1 space-y-1 text-gray-600">
                                {pkg.premiumFeatures.afterDelivery.map(
                                  (item, index) => (
                                    <li
                                      key={index}
                                      className="flex items-start"
                                    >
                                      <CheckIcon className="w-3 h-3 mr-2 text-amber-500 flex-shrink-0 mt-0.5" />
                                      {item}
                                    </li>
                                  ),
                                )}
                              </ul>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    ) : null}

                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(pkg)}
                        className="flex-1 py-2 rounded-lg font-semibold text-blue-600 border border-blue-600 hover:bg-blue-50 transition-colors duration-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(pkg)}
                        disabled={isDeleting}
                        className="flex-1 py-2 rounded-lg font-semibold text-red-600 border border-red-600 hover:bg-red-50 transition-colors duration-200 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                    <button
                      onClick={() => setSelectedPackage(pkg)}
                      className={`mt-2 w-full py-3 rounded-lg font-semibold text-white bg-gradient-to-r ${theme.color} hover:opacity-90 transition-opacity duration-200`}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bonus Courses Section */}
        {bonusCourses.length ? (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8 mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                Bonus Courses
              </h2>
              <p className="text-gray-600">
                Optional add-ons to enhance your pregnancy journey
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {bonusCourses.map((course, index) => (
                <div
                  key={course._id}
                  className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center justify-between hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-10 h-10 shrink-0 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {index + 1}
                    </div>
                    <button
                      onClick={() => handleEdit(course)}
                      className="font-medium text-gray-800 text-left truncate hover:text-blue-600"
                      title={`Edit ${course.name}`}
                    >
                      {course.name}
                    </button>
                  </div>
                  <span className="shrink-0 text-lg font-bold text-green-600">
                    {formatPrice(course.selectedPlan?.price)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Package Detail Modal */}
        {selectedPackage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div
                className={`bg-gradient-to-r ${getTierTheme(selectedPackage).color} p-8 text-white sticky top-0`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-3xl font-bold mb-1">
                      {selectedPackage.name}
                    </h2>
                    <p className="text-lg opacity-90 mb-3">
                      {selectedPackage.subtitle}
                    </p>
                    <PriceTag
                      plan={selectedPackage.selectedPlan}
                      size="modal"
                    />
                    <p className="mt-1 text-sm opacity-90">
                      {TRIMESTER_LABELS[
                        selectedPackage.selectedPlan?.trimester
                      ] || ""}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedPackage(null)}
                    className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors duration-150"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
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
              </div>

              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <ClockIcon className="w-6 h-6 mr-3 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-500">Duration</p>
                      <p className="font-semibold text-gray-800">
                        {selectedPackage.duration || "-"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <UserIcon className="w-6 h-6 mr-3 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-500">Ideal For</p>
                      <p className="font-semibold text-gray-800">
                        {selectedPackage.idealFor || "-"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Trimester pricing */}
                {selectedPackage.plans?.length ? (
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">
                      Trimester Pricing
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {selectedPackage.plans.map((plan) => (
                        <div
                          key={plan.trimester}
                          className="p-4 bg-gray-50 rounded-lg"
                        >
                          <p className="text-sm text-gray-500">
                            {TRIMESTER_LABELS[plan.trimester] || plan.trimester}
                          </p>
                          <p className="text-2xl font-bold text-gray-800">
                            {formatPrice(plan.price)}
                          </p>
                          {typeof plan.originalPrice === "number" &&
                          plan.originalPrice > 0 ? (
                            <p className="text-sm text-gray-400 line-through">
                              {formatPrice(plan.originalPrice)}
                            </p>
                          ) : null}
                          <p className="mt-1 text-xs text-gray-500">
                            {plan.durationInDays} days access
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {/* All Modules */}
                {selectedPackage.modules?.length ? (
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">
                      Course Modules ({selectedPackage.modules.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedPackage.modules.map((module, index) => (
                        <div
                          key={index}
                          className="flex items-center p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="w-8 h-8 shrink-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold mr-3">
                            {index + 1}
                          </div>
                          <span className="text-gray-700">{module}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {/* All Includes */}
                {selectedPackage.includes?.length ? (
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">
                      What is Included
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedPackage.includes.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center p-3 bg-green-50 rounded-lg"
                        >
                          <CheckIcon className="w-5 h-5 mr-3 text-green-600 shrink-0" />
                          <span className="text-gray-700">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {/* Premium Features for Elite */}
                {premiumGroupsWithItems(selectedPackage.premiumFeatures)
                  .length ? (
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">
                      Premium Features
                    </h3>
                    <div className="space-y-4">
                      {premiumGroupsWithItems(
                        selectedPackage.premiumFeatures,
                      ).map(([category, features]) => (
                          <div
                            key={category}
                            className="p-4 bg-amber-50 rounded-lg"
                          >
                            <h4 className="font-semibold text-gray-800 mb-3 capitalize">
                              {category.replace(/([A-Z])/g, " $1").trim()}
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {features.map((feature, index) => (
                                <div
                                  key={index}
                                  className="flex items-start text-sm text-gray-700"
                                >
                                  <CheckIcon className="w-4 h-4 mr-2 text-amber-600 flex-shrink-0 mt-0.5" />
                                  {feature}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ) : null}

                {/* Exclusive Benefits for Pro */}
                {selectedPackage.exclusiveBenefits?.length ? (
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">
                      Exclusive Benefits
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedPackage.exclusiveBenefits.map(
                        (benefit, index) => (
                          <div
                            key={index}
                            className="flex items-center p-3 bg-purple-50 rounded-lg"
                          >
                            <CheckIcon className="w-5 h-5 mr-3 text-purple-600 shrink-0" />
                            <span className="text-gray-700">{benefit}</span>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                ) : null}

                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setSelectedPackage(null)}
                    className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-150"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => handleEdit(selectedPackage)}
                    className={`px-8 py-3 text-white bg-gradient-to-r ${getTierTheme(selectedPackage).color} rounded-lg hover:opacity-90 transition-opacity duration-200 font-semibold`}
                  >
                    Edit {selectedPackage.name}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export { PackagesPage };
