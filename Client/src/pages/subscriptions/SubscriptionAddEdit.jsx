import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

import {
  usePostMutation,
  useGetQuery,
  usePutMutation,
} from "../../api/apiCall";
import API_ENDPOINTS from "../../api/apiEndpoint";
import Loader from "../../components/UI/Loader";
import {
  PLAN_TRIMESTERS,
  SUBSCRIPTION_TIERS,
  TIER_OPTIONS,
  TRIMESTER_LABELS,
  TRIMESTER_DURATION_DAYS,
} from "../../constants/subscription";

/* Tiers that price per trimester; Basic and the bonus courses cost the same
   whenever the mother joins, so they carry a single "all trimesters" plan. */
const TRIMESTER_PRICED_TIERS = [
  SUBSCRIPTION_TIERS.PRO,
  SUBSCRIPTION_TIERS.ELITE,
];

const PREMIUM_GROUPS = [
  { key: "medicalCare", label: "Medical Care" },
  { key: "holisticWellness", label: "Holistic Wellness" },
  { key: "birthPreparation", label: "Birth Preparation" },
  { key: "afterDelivery", label: "After Delivery" },
  { key: "premiumSupport", label: "Premium Support" },
];

const emptyPlan = (trimester) => ({
  trimester,
  price: "",
  originalPrice: "",
  durationInDays: String(TRIMESTER_DURATION_DAYS[trimester] || ""),
  isActive: true,
});

const defaultPlansForTier = (tier) =>
  TRIMESTER_PRICED_TIERS.includes(tier)
    ? [
        emptyPlan(PLAN_TRIMESTERS.FIRST),
        emptyPlan(PLAN_TRIMESTERS.SECOND),
        emptyPlan(PLAN_TRIMESTERS.THIRD),
      ]
    : [emptyPlan(PLAN_TRIMESTERS.ALL)];

const toLines = (list) => (Array.isArray(list) ? list.join("\n") : "");

const fromLines = (text) =>
  text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

const emptyPremiumFeatures = () =>
  PREMIUM_GROUPS.reduce((acc, group) => ({ ...acc, [group.key]: "" }), {});

const initialState = {
  name: "",
  tier: SUBSCRIPTION_TIERS.PRO,
  subtitle: "",
  description: "",
  duration: "",
  idealFor: "",
  badge: "",
  displayOrder: "0",
  isPopular: false,
  isFree: false,
  isActive: true,
  modules: "",
  includes: "",
  exclusiveBenefits: "",
  premiumFeatures: emptyPremiumFeatures(),
  plans: defaultPlansForTier(SUBSCRIPTION_TIERS.PRO),
};

const fieldClass =
  "border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition";

export const SubscriptionAddEdit = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialState);

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
    const item =
      subscriptionData?.data || subscriptionData?.result || subscriptionData;
    if (!item?._id) return;

    setFormData({
      name: item.name || "",
      tier: item.tier || SUBSCRIPTION_TIERS.PRO,
      subtitle: item.subtitle || "",
      description: item.description || "",
      duration: item.duration || "",
      idealFor: item.idealFor || "",
      badge: item.badge || "",
      displayOrder:
        typeof item.displayOrder === "number" ? String(item.displayOrder) : "0",
      isPopular: !!item.isPopular,
      isFree: !!item.isFree,
      isActive: typeof item.isActive === "boolean" ? item.isActive : true,
      modules: toLines(item.modules),
      includes: toLines(item.includes),
      exclusiveBenefits: toLines(item.exclusiveBenefits),
      premiumFeatures: PREMIUM_GROUPS.reduce(
        (acc, group) => ({
          ...acc,
          [group.key]: toLines(item.premiumFeatures?.[group.key]),
        }),
        {},
      ),
      plans: item.plans?.length
        ? item.plans.map((plan) => ({
            trimester: plan.trimester,
            price: typeof plan.price === "number" ? String(plan.price) : "",
            originalPrice:
              typeof plan.originalPrice === "number"
                ? String(plan.originalPrice)
                : "",
            durationInDays:
              typeof plan.durationInDays === "number"
                ? String(plan.durationInDays)
                : "",
            isActive: plan.isActive !== false,
          }))
        : defaultPlansForTier(item.tier),
    });
  }, [isEditMode, subscriptionData]);

  const isLoading = isAdding || isUpdating;

  const usedTrimesters = useMemo(
    () => formData.plans.map((plan) => plan.trimester),
    [formData.plans],
  );

  const setField = (key, value) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const handleTierChange = (tier) => {
    setFormData((prev) => {
      const switchingPricingStyle =
        TRIMESTER_PRICED_TIERS.includes(tier) !==
        TRIMESTER_PRICED_TIERS.includes(prev.tier);

      return {
        ...prev,
        tier,
        // Only reset the rows when the pricing style itself changes, so a
        // Pro -> Elite switch keeps whatever prices were already typed in
        plans: switchingPricingStyle ? defaultPlansForTier(tier) : prev.plans,
      };
    });
  };

  const updatePlan = (index, key, value) =>
    setFormData((prev) => ({
      ...prev,
      plans: prev.plans.map((plan, i) =>
        i === index ? { ...plan, [key]: value } : plan,
      ),
    }));

  const addPlan = () => {
    const free = Object.values(PLAN_TRIMESTERS).find(
      (value) => !usedTrimesters.includes(value),
    );
    if (!free) {
      toast.error("All trimesters already have a plan");
      return;
    }
    setFormData((prev) => ({ ...prev, plans: [...prev.plans, emptyPlan(free)] }));
  };

  const removePlan = (index) => {
    if (formData.plans.length === 1) {
      toast.error("At least one plan is required");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      plans: prev.plans.filter((_, i) => i !== index),
    }));
  };

  const buildPayload = () => {
    const plans = [];

    for (const plan of formData.plans) {
      const price = Number(plan.price);
      if (plan.price === "" || !Number.isFinite(price) || price < 0) {
        toast.error(
          `Enter a valid price for ${TRIMESTER_LABELS[plan.trimester]}`,
        );
        return null;
      }

      const originalPrice = Number(plan.originalPrice);
      const durationInDays = Number(plan.durationInDays);

      plans.push({
        trimester: plan.trimester,
        price,
        originalPrice:
          plan.originalPrice === "" || !Number.isFinite(originalPrice)
            ? null
            : originalPrice,
        durationInDays:
          plan.durationInDays === "" || !Number.isFinite(durationInDays)
            ? TRIMESTER_DURATION_DAYS[plan.trimester]
            : durationInDays,
        isActive: !!plan.isActive,
      });
    }

    const trimesters = plans.map((plan) => plan.trimester);
    if (new Set(trimesters).size !== trimesters.length) {
      toast.error("Each trimester can only have one plan");
      return null;
    }

    return {
      name: formData.name.trim(),
      tier: formData.tier,
      subtitle: formData.subtitle.trim(),
      description: formData.description.trim(),
      duration: formData.duration.trim(),
      idealFor: formData.idealFor.trim(),
      badge: formData.badge.trim(),
      displayOrder: Number(formData.displayOrder) || 0,
      isPopular: !!formData.isPopular,
      isFree: !!formData.isFree,
      isActive: !!formData.isActive,
      modules: fromLines(formData.modules),
      includes: fromLines(formData.includes),
      exclusiveBenefits: fromLines(formData.exclusiveBenefits),
      premiumFeatures: PREMIUM_GROUPS.reduce(
        (acc, group) => ({
          ...acc,
          [group.key]: fromLines(formData.premiumFeatures[group.key] || ""),
        }),
        {},
      ),
      plans,
    };
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    const payload = buildPayload();
    if (!payload) return;

    const onSuccess = (res) => {
      toast.success(res?.message || (isEditMode ? "Updated" : "Created"));
      setTimeout(() => navigate("/subscriptions"), 800);
    };

    const onError = (error) => {
      toast.error(
        error?.response?.data?.message || error?.message || "Operation failed",
      );
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

  const showPremiumFeatures = formData.tier === SUBSCRIPTION_TIERS.ELITE;

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="bg-white shadow-lg rounded-lg p-6">
        <div className="flex justify-between items-center mb-6 pb-3 border-b">
          <h2 className="text-2xl font-bold text-gray-800">
            {isEditMode ? "Edit Package" : "Add Package"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* ---------------- Basics ---------------- */}
          <section className="space-y-4">
            <h3 className="font-semibold text-gray-800">Package Details</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label htmlFor="name" className="mb-2 font-medium text-gray-700">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="PRO PACKAGE"
                  value={formData.name}
                  onChange={(e) => setField("name", e.target.value)}
                  className={fieldClass}
                  required
                  maxLength={120}
                  disabled={isLoading}
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="tier" className="mb-2 font-medium text-gray-700">
                  Tier <span className="text-red-500">*</span>
                </label>
                <select
                  id="tier"
                  value={formData.tier}
                  onChange={(e) => handleTierChange(e.target.value)}
                  className={fieldClass}
                  disabled={isLoading}
                >
                  {TIER_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="mb-2 font-medium text-gray-700">
                  Subtitle
                </label>
                <input
                  type="text"
                  placeholder="Holistic Pregnancy Transformation"
                  value={formData.subtitle}
                  onChange={(e) => setField("subtitle", e.target.value)}
                  className={fieldClass}
                  maxLength={160}
                  disabled={isLoading}
                />
              </div>

              <div className="flex flex-col">
                <label className="mb-2 font-medium text-gray-700">
                  Badge
                </label>
                <input
                  type="text"
                  placeholder="Best Value"
                  value={formData.badge}
                  onChange={(e) => setField("badge", e.target.value)}
                  className={fieldClass}
                  maxLength={60}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="mb-2 font-medium text-gray-700">
                  Duration (shown on card)
                </label>
                <input
                  type="text"
                  placeholder="Entire Pregnancy"
                  value={formData.duration}
                  onChange={(e) => setField("duration", e.target.value)}
                  className={fieldClass}
                  maxLength={120}
                  disabled={isLoading}
                />
              </div>

              <div className="flex flex-col">
                <label className="mb-2 font-medium text-gray-700">
                  Ideal For
                </label>
                <input
                  type="text"
                  placeholder="Mothers seeking comprehensive care"
                  value={formData.idealFor}
                  onChange={(e) => setField("idealFor", e.target.value)}
                  className={fieldClass}
                  maxLength={160}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="flex flex-col">
              <label className="mb-2 font-medium text-gray-700">
                Description
              </label>
              <textarea
                placeholder="Enter description"
                value={formData.description}
                onChange={(e) => setField("description", e.target.value)}
                className={`${fieldClass} resize-vertical`}
                rows="3"
                maxLength={500}
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="mb-2 font-medium text-gray-700">
                  Display Order
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.displayOrder}
                  onChange={(e) => setField("displayOrder", e.target.value)}
                  className={fieldClass}
                  disabled={isLoading}
                />
              </div>

              <div className="flex flex-col">
                <label className="mb-2 font-medium text-gray-700">Status</label>
                <select
                  value={String(!!formData.isActive)}
                  onChange={(e) =>
                    setField("isActive", e.target.value === "true")
                  }
                  className={fieldClass}
                  disabled={isLoading}
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={formData.isPopular}
                  onChange={(e) => setField("isPopular", e.target.checked)}
                  disabled={isLoading}
                />
                Highlight as most popular
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={formData.isFree}
                  onChange={(e) => setField("isFree", e.target.checked)}
                  disabled={isLoading}
                />
                Free package
              </label>
            </div>
          </section>

          {/* ---------------- Plans ---------------- */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-800">
                  Trimester Plans <span className="text-red-500">*</span>
                </h3>
                <p className="text-sm text-gray-500">
                  One price per trimester the mother can join in. The card shows
                  the cheapest plan as the starting price.
                </p>
              </div>
              <button
                type="button"
                onClick={addPlan}
                className="text-sm text-blue-600 hover:underline"
                disabled={isLoading}
              >
                + Add plan
              </button>
            </div>

            <div className="space-y-3">
              {formData.plans.map((plan, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end border rounded-lg p-3"
                >
                  <div className="md:col-span-3 flex flex-col">
                    <label className="text-xs font-medium text-gray-600 mb-1">
                      Trimester
                    </label>
                    <select
                      value={plan.trimester}
                      onChange={(e) =>
                        updatePlan(index, "trimester", e.target.value)
                      }
                      className="border rounded px-2 py-2 text-sm"
                      disabled={isLoading}
                    >
                      {Object.values(PLAN_TRIMESTERS).map((value) => (
                        <option key={value} value={value}>
                          {TRIMESTER_LABELS[value]}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2 flex flex-col">
                    <label className="text-xs font-medium text-gray-600 mb-1">
                      Price
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="9999"
                      value={plan.price}
                      onChange={(e) =>
                        updatePlan(index, "price", e.target.value)
                      }
                      className="border rounded px-2 py-2 text-sm"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="md:col-span-2 flex flex-col">
                    <label className="text-xs font-medium text-gray-600 mb-1">
                      Cut Price
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="14999"
                      value={plan.originalPrice}
                      onChange={(e) =>
                        updatePlan(index, "originalPrice", e.target.value)
                      }
                      className="border rounded px-2 py-2 text-sm"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="md:col-span-2 flex flex-col">
                    <label className="text-xs font-medium text-gray-600 mb-1">
                      Days
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="180"
                      value={plan.durationInDays}
                      onChange={(e) =>
                        updatePlan(index, "durationInDays", e.target.value)
                      }
                      className="border rounded px-2 py-2 text-sm"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="md:col-span-2 flex items-center gap-2 pb-2">
                    <input
                      id={`plan-active-${index}`}
                      type="checkbox"
                      checked={plan.isActive}
                      onChange={(e) =>
                        updatePlan(index, "isActive", e.target.checked)
                      }
                      disabled={isLoading}
                    />
                    <label
                      htmlFor={`plan-active-${index}`}
                      className="text-sm text-gray-700"
                    >
                      Active
                    </label>
                  </div>

                  <div className="md:col-span-1 pb-1">
                    <button
                      type="button"
                      onClick={() => removePlan(index)}
                      className="text-sm text-red-600 hover:underline"
                      disabled={isLoading}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ---------------- Content ---------------- */}
          <section className="space-y-4">
            <h3 className="font-semibold text-gray-800">Content</h3>
            <p className="text-sm text-gray-500">One item per line.</p>

            <div className="flex flex-col">
              <label className="mb-2 font-medium text-gray-700">
                Course Modules
              </label>
              <textarea
                value={formData.modules}
                onChange={(e) => setField("modules", e.target.value)}
                className={`${fieldClass} resize-vertical font-mono text-sm`}
                rows="8"
                placeholder={"Trimester-wise Masterclasses\nAdvanced Pregnancy Yoga"}
                disabled={isLoading}
              />
            </div>

            <div className="flex flex-col">
              <label className="mb-2 font-medium text-gray-700">Includes</label>
              <textarea
                value={formData.includes}
                onChange={(e) => setField("includes", e.target.value)}
                className={`${fieldClass} resize-vertical font-mono text-sm`}
                rows="6"
                placeholder={"Everything in Basic Package\nWeekly Live Q&A"}
                disabled={isLoading}
              />
            </div>

            <div className="flex flex-col">
              <label className="mb-2 font-medium text-gray-700">
                Exclusive Benefits
              </label>
              <textarea
                value={formData.exclusiveBenefits}
                onChange={(e) => setField("exclusiveBenefits", e.target.value)}
                className={`${fieldClass} resize-vertical font-mono text-sm`}
                rows="4"
                disabled={isLoading}
              />
            </div>
          </section>

          {/* ---------------- Premium features (Elite) ---------------- */}
          {showPremiumFeatures ? (
            <section className="space-y-4">
              <h3 className="font-semibold text-gray-800">Premium Features</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {PREMIUM_GROUPS.map((group) => (
                  <div key={group.key} className="flex flex-col">
                    <label className="mb-2 font-medium text-gray-700">
                      {group.label}
                    </label>
                    <textarea
                      value={formData.premiumFeatures[group.key] || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          premiumFeatures: {
                            ...prev.premiumFeatures,
                            [group.key]: e.target.value,
                          },
                        }))
                      }
                      className={`${fieldClass} resize-vertical font-mono text-sm`}
                      rows="5"
                      disabled={isLoading}
                    />
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
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
                  ? "Update Package"
                  : "Add Package"}
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
