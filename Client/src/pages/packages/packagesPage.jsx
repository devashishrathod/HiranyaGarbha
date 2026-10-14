import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  Check,
  Clock,
  Crown,
  Gift,
  Package as PackageIcon,
  Pencil,
  Plus,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

import { useDeleteMutation, useGetQuery } from "../../api/apiCall";
import API_ENDPOINTS from "../../api/apiEndpoint";
import { Button, EmptyState, Modal, PageHeader } from "../../components/UI/kit";
import {
  PLAN_TRIMESTERS,
  TRIMESTER_LABELS,
  TRIMESTER_TABS,
  formatPrice,
  getTierTheme,
} from "../../constants/subscription";
import { buildQuery } from "../../utils/ids";

/* A package saved from the panel always carries the premium-feature groups,
   so emptiness is what decides whether the section renders, not presence. */
const premiumGroupsWithItems = (premiumFeatures) =>
  Object.entries(premiumFeatures || {}).filter(
    ([, features]) => Array.isArray(features) && features.length,
  );

const MODULES_ON_CARD = 5;
const INCLUDES_ON_CARD = 4;

/* Price block shared by the card header and the detail modal */
const PriceTag = ({ plan, size = "card" }) => {
  if (!plan) return null;

  const priceClass = size === "modal" ? "text-4xl" : "text-3xl";
  const originalClass = size === "modal" ? "text-xl" : "text-sm";

  return (
    <div className="flex items-baseline gap-2">
      <span className={`${priceClass} font-bold`}>{formatPrice(plan.price)}</span>
      {typeof plan.originalPrice === "number" && plan.originalPrice > 0 ? (
        <span className={`${originalClass} line-through opacity-75`}>
          {formatPrice(plan.originalPrice)}
        </span>
      ) : null}
    </div>
  );
};

const CheckList = ({ items, limit, tone, moreLabel }) => (
  <ul className="space-y-1.5">
    {items.slice(0, limit).map((item, index) => (
      <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
        <Check size={15} className={`mt-0.5 shrink-0 ${tone}`} aria-hidden="true" />
        <span>{item}</span>
      </li>
    ))}
    {items.length > limit ? (
      <li className="pl-[23px] text-xs font-medium text-gray-500">
        +{items.length - limit} more {moreLabel}
      </li>
    ) : null}
  </ul>
);

/**
 * One package. Every card is the same shape — header, a fixed amount of
 * content, then the actions pinned to the bottom — so a long package does not
 * stretch the row and leave its neighbours with a gap above their buttons.
 * The full lists live in the detail view.
 */
const PackageCard = ({ pkg, trimester, onView, onEdit, onDelete }) => {
  const theme = getTierTheme(pkg);
  const plan = pkg.selectedPlan;
  const premiumCount = premiumGroupsWithItems(pkg.premiumFeatures).reduce(
    (count, [, features]) => count + features.length,
    0,
  );
  const samePriceEverywhere = plan?.trimester && plan.trimester !== trimester;

  return (
    <article
      className={`flex h-full flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-shadow hover:shadow-md ${
        pkg.isPopular ? "border-purple-300 ring-2 ring-purple-500/50" : "border-gray-200/80"
      } ${pkg.isActive ? "" : "opacity-75"}`}
    >
      <header className={`bg-gradient-to-r ${theme.color} px-5 py-5 text-white`}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-bold">{pkg.name}</h2>
            {pkg.subtitle ? (
              <p className="truncate text-sm text-white/85">{pkg.subtitle}</p>
            ) : null}
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            {pkg.badge ? (
              <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold">
                {pkg.badge}
              </span>
            ) : null}
            {!pkg.isActive ? (
              <span className="rounded-full bg-gray-900/40 px-2.5 py-0.5 text-xs font-semibold">
                Inactive
              </span>
            ) : null}
          </div>
        </div>
        <div className="mt-4">
          <PriceTag plan={plan} />
          <p className="mt-1 text-xs text-white/85">
            {samePriceEverywhere
              ? "Same price in every trimester"
              : plan?.durationInDays
                ? `${plan.durationInDays} days access`
                : " "}
          </p>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-5 p-5">
        <div className="space-y-1.5 text-sm text-gray-600">
          <p className="flex items-center gap-2">
            <Clock size={15} className="shrink-0 text-gray-400" aria-hidden="true" />
            <span className="truncate">{pkg.duration || "Duration not set"}</span>
          </p>
          <p className="flex items-center gap-2">
            <UserRound size={15} className="shrink-0 text-gray-400" aria-hidden="true" />
            <span className="truncate">{pkg.idealFor || "Audience not set"}</span>
          </p>
        </div>

        {pkg.modules?.length ? (
          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Course modules · {pkg.modules.length}
            </h3>
            <CheckList items={pkg.modules} limit={MODULES_ON_CARD} tone="text-emerald-500" moreLabel="modules" />
          </section>
        ) : null}

        {pkg.includes?.length ? (
          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Includes
            </h3>
            <CheckList items={pkg.includes} limit={INCLUDES_ON_CARD} tone="text-blue-500" moreLabel="features" />
          </section>
        ) : null}

        {pkg.plans?.length > 1 ? (
          <div className="divide-y divide-gray-100 rounded-xl border border-gray-200">
            {pkg.plans.map((item) => (
              <div
                key={item.trimester}
                className={`flex items-center justify-between px-3 py-2 text-sm ${
                  item.trimester === trimester ? "bg-gray-50 font-semibold text-gray-900" : "text-gray-600"
                }`}
              >
                <span>{TRIMESTER_LABELS[item.trimester] || item.trimester}</span>
                <span className="tabular-nums">{formatPrice(item.price)}</span>
              </div>
            ))}
          </div>
        ) : null}

        {premiumCount ? (
          <p className="inline-flex items-center gap-2 self-start rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 ring-1 ring-inset ring-amber-200">
            <Crown size={14} aria-hidden="true" />
            {premiumCount} premium features
          </p>
        ) : null}

        <div className="mt-auto flex gap-2 pt-1">
          <button
            type="button"
            onClick={() => onView(pkg)}
            className={`flex-1 rounded-lg bg-gradient-to-r ${theme.color} px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90`}
          >
            View details
          </button>
          <button
            type="button"
            onClick={() => onEdit(pkg)}
            aria-label={`Edit ${pkg.name}`}
            title="Edit"
            className="flex h-10 w-11 items-center justify-center rounded-lg border border-gray-300 text-gray-600 transition-colors hover:bg-gray-50 hover:text-blue-600"
          >
            <Pencil size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(pkg)}
            aria-label={`Delete ${pkg.name}`}
            title="Delete"
            className="flex h-10 w-11 items-center justify-center rounded-lg border border-gray-300 text-gray-600 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
};

const PackagesPage = () => {
  const [trimester, setTrimester] = useState(PLAN_TRIMESTERS.FIRST);
  const [showInactive, setShowInactive] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const navigate = useNavigate();

  const endpoint = `${API_ENDPOINTS.SUBSCRIPTIONS.GET_PACKAGES}${buildQuery({
    trimester,
    includeInactive: showInactive ? "true" : undefined,
  })}`;

  const {
    data: packagesData,
    isLoading,
    error,
    refetch,
  } = useGetQuery(endpoint, ["packages", trimester, showInactive]);

  const { mutate: deletePackage, isPending: isDeleting } = useDeleteMutation(
    API_ENDPOINTS.SUBSCRIPTIONS.DELETE,
  );

  const packages = useMemo(() => packagesData?.data?.packages || [], [packagesData]);
  const bonusCourses = useMemo(() => packagesData?.data?.bonusCourses || [], [packagesData]);

  const handleAddNew = () => navigate("/subscriptions/add");
  const handleEdit = (pkg) => navigate(`/subscriptions/update/${pkg._id}`);

  const confirmDelete = () => {
    if (!pendingDelete) return;
    deletePackage(pendingDelete._id, {
      onSuccess: (res) => {
        toast.success(res?.message || "Package deleted");
        if (selectedPackage?._id === pendingDelete._id) setSelectedPackage(null);
        setPendingDelete(null);
        refetch();
      },
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Packages"
        subtitle="The plans patients can buy, priced by the trimester they join in."
        actions={
          <>
            <label className="inline-flex cursor-pointer select-none items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(event) => setShowInactive(event.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Show inactive
            </label>
            <Button icon={Plus} onClick={handleAddNew}>
              Add package
            </Button>
          </>
        }
      />

      {/* Trimester — the price a mother pays depends on how much journey is left */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-gray-600">Prices for mothers joining in</span>
        <div className="inline-flex flex-wrap gap-1 rounded-xl bg-gray-100 p-1" role="group" aria-label="Trimester">
          {TRIMESTER_TABS.map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={trimester === value}
              onClick={() => setTrimester(value)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                trimester === value
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {TRIMESTER_LABELS[value]}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((key) => (
            <div key={key} className="h-[520px] animate-pulse rounded-2xl border border-gray-200/80 bg-white">
              <div className="h-36 rounded-t-2xl bg-gray-200" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-gray-200/80 bg-white shadow-sm">
          <EmptyState
            icon={PackageIcon}
            title="Packages could not load"
            message={error?.response?.data?.message || error.message}
            action={<Button onClick={() => refetch()}>Try again</Button>}
          />
        </div>
      ) : (
        <>
          {packages.length ? (
            <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 xl:grid-cols-3">
              {packages.map((pkg) => (
                <PackageCard
                  key={pkg._id}
                  pkg={pkg}
                  trimester={trimester}
                  onView={setSelectedPackage}
                  onEdit={handleEdit}
                  onDelete={setPendingDelete}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-gray-200/80 bg-white shadow-sm">
              <EmptyState
                icon={PackageIcon}
                title="No packages yet"
                message={
                  showInactive
                    ? "There are no packages at all. Create one to get started."
                    : "No active packages. Create one, or turn on “Show inactive”."
                }
                action={
                  <Button icon={Plus} onClick={handleAddNew}>
                    Add package
                  </Button>
                }
              />
            </div>
          )}

          {bonusCourses.length ? (
            <section className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900">
                    <Gift size={18} className="text-emerald-600" aria-hidden="true" />
                    Bonus courses
                  </h2>
                  <p className="mt-0.5 text-sm text-gray-500">
                    Add-ons a patient can buy alongside any package
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {bonusCourses.map((course) => (
                  <div
                    key={course._id}
                    className={`flex items-center gap-3 rounded-xl border border-gray-200 p-3 transition-shadow hover:shadow-sm ${
                      course.isActive ? "" : "opacity-70"
                    }`}
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-blue-500 text-white">
                      <Gift size={18} aria-hidden="true" />
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedPackage(course)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <span className="block truncate text-sm font-semibold text-gray-900 hover:text-blue-600" title={course.name}>
                        {course.name}
                      </span>
                      <span className="block text-xs text-gray-500">
                        {course.selectedPlan?.durationInDays
                          ? `${course.selectedPlan.durationInDays} days`
                          : "Self-paced"}
                        {course.isActive ? "" : " · Inactive"}
                      </span>
                    </button>
                    <span className="shrink-0 text-sm font-bold tabular-nums text-emerald-700">
                      {formatPrice(course.selectedPlan?.price)}
                    </span>
                    <div className="flex shrink-0 gap-1">
                      <button
                        type="button"
                        onClick={() => handleEdit(course)}
                        aria-label={`Edit ${course.name}`}
                        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-blue-600"
                      >
                        <Pencil size={15} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setPendingDelete(course)}
                        aria-label={`Delete ${course.name}`}
                        className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 size={15} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </>
      )}

      {/* Package detail */}
      {selectedPackage ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-xl">
            <div className={`sticky top-0 bg-gradient-to-r ${getTierTheme(selectedPackage).color} p-6 text-white sm:p-8`}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="mb-1 text-2xl font-bold sm:text-3xl">{selectedPackage.name}</h2>
                  {selectedPackage.subtitle ? (
                    <p className="mb-3 text-white/90">{selectedPackage.subtitle}</p>
                  ) : null}
                  <PriceTag plan={selectedPackage.selectedPlan} size="modal" />
                  <p className="mt-1 text-sm text-white/90">
                    {TRIMESTER_LABELS[selectedPackage.selectedPlan?.trimester] || ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedPackage(null)}
                  aria-label="Close"
                  className="rounded-lg p-2 transition-colors hover:bg-white/20"
                >
                  <X size={22} aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="space-y-8 p-6 sm:p-8">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4">
                  <Clock size={22} className="text-blue-600" aria-hidden="true" />
                  <div>
                    <p className="text-sm text-gray-500">Duration</p>
                    <p className="font-semibold text-gray-800">{selectedPackage.duration || "-"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4">
                  <UserRound size={22} className="text-purple-600" aria-hidden="true" />
                  <div>
                    <p className="text-sm text-gray-500">Ideal for</p>
                    <p className="font-semibold text-gray-800">{selectedPackage.idealFor || "-"}</p>
                  </div>
                </div>
              </div>

              {selectedPackage.plans?.length ? (
                <section>
                  <h3 className="mb-3 text-lg font-bold text-gray-800">Trimester pricing</h3>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    {selectedPackage.plans.map((item) => (
                      <div key={item.trimester} className="rounded-xl bg-gray-50 p-4">
                        <p className="text-sm text-gray-500">
                          {TRIMESTER_LABELS[item.trimester] || item.trimester}
                        </p>
                        <p className="text-2xl font-bold text-gray-800">{formatPrice(item.price)}</p>
                        {typeof item.originalPrice === "number" && item.originalPrice > 0 ? (
                          <p className="text-sm text-gray-400 line-through">{formatPrice(item.originalPrice)}</p>
                        ) : null}
                        <p className="mt-1 text-xs text-gray-500">{item.durationInDays} days access</p>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}

              {selectedPackage.modules?.length ? (
                <section>
                  <h3 className="mb-3 text-lg font-bold text-gray-800">
                    Course modules ({selectedPackage.modules.length})
                  </h3>
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    {selectedPackage.modules.map((module, index) => (
                      <div key={index} className="flex items-center rounded-xl bg-gray-50 p-3">
                        <span className="mr-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-xs font-semibold text-white">
                          {index + 1}
                        </span>
                        <span className="text-sm text-gray-700">{module}</span>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}

              {selectedPackage.includes?.length ? (
                <section>
                  <h3 className="mb-3 text-lg font-bold text-gray-800">What is included</h3>
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    {selectedPackage.includes.map((item, index) => (
                      <div key={index} className="flex items-center rounded-xl bg-emerald-50 p-3">
                        <Check size={18} className="mr-3 shrink-0 text-emerald-600" aria-hidden="true" />
                        <span className="text-sm text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}

              {premiumGroupsWithItems(selectedPackage.premiumFeatures).length ? (
                <section>
                  <h3 className="mb-3 text-lg font-bold text-gray-800">Premium features</h3>
                  <div className="space-y-3">
                    {premiumGroupsWithItems(selectedPackage.premiumFeatures).map(([category, features]) => (
                      <div key={category} className="rounded-xl bg-amber-50 p-4">
                        <h4 className="mb-2 font-semibold capitalize text-gray-800">
                          {category.replace(/([A-Z])/g, " $1").trim()}
                        </h4>
                        <div className="grid grid-cols-1 gap-1.5 md:grid-cols-2">
                          {features.map((feature, index) => (
                            <div key={index} className="flex items-start text-sm text-gray-700">
                              <Check size={15} className="mr-2 mt-0.5 shrink-0 text-amber-600" aria-hidden="true" />
                              {feature}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}

              {selectedPackage.exclusiveBenefits?.length ? (
                <section>
                  <h3 className="mb-3 text-lg font-bold text-gray-800">Exclusive benefits</h3>
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    {selectedPackage.exclusiveBenefits.map((benefit, index) => (
                      <div key={index} className="flex items-center rounded-xl bg-purple-50 p-3">
                        <Check size={18} className="mr-3 shrink-0 text-purple-600" aria-hidden="true" />
                        <span className="text-sm text-gray-700">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}

              <div className="flex flex-wrap justify-end gap-3 border-t border-gray-200 pt-6">
                <Button variant="secondary" onClick={() => setSelectedPackage(null)}>
                  Close
                </Button>
                <Button variant="danger" icon={Trash2} onClick={() => setPendingDelete(selectedPackage)}>
                  Delete
                </Button>
                <Button icon={Pencil} onClick={() => handleEdit(selectedPackage)}>
                  Edit {selectedPackage.name}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Delete confirmation — after the detail view, so it opens on top of it */}
      <Modal
        open={Boolean(pendingDelete)}
        size="sm"
        title={`Delete ${pendingDelete?.name || "this package"}?`}
        description="It disappears from the app straight away."
        onClose={() => (isDeleting ? null : setPendingDelete(null))}
        footer={
          <>
            <Button variant="secondary" onClick={() => setPendingDelete(null)} disabled={isDeleting}>
              Keep it
            </Button>
            <Button variant="danger" icon={Trash2} onClick={confirmDelete} loading={isDeleting}>
              Delete package
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          Patients who already bought it keep their plan. To hide it for a while instead, edit the
          package and switch it to inactive.
        </p>
      </Modal>
    </div>
  );
};

export { PackagesPage };
