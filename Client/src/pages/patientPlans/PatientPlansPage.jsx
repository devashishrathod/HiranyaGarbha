import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { keepPreviousData } from "@tanstack/react-query";
import {
  CalendarClock,
  ChevronRight,
  CircleCheckBig,
  IndianRupee,
  Layers,
  ReceiptText,
  Search,
} from "lucide-react";

import { useGetQuery } from "../../api/apiCall";
import API_ENDPOINTS from "../../api/apiEndpoint";
import PlanDetailModal from "../../components/patientPlans/PlanDetailModal";
import {
  TIER_TONE,
  formatAmount,
  periodNote,
  tierLabel,
  trimesterLabel,
} from "../../components/patientPlans/planFormat";
import Pagination from "../../components/UI/Pagination";
import {
  Avatar,
  Button,
  EmptyState,
  PageHeader,
  Pill,
  Select,
  SkeletonRows,
  StatCard,
} from "../../components/UI/kit";
import {
  PLAN_KIND_OPTIONS,
  PLAN_PAYMENT_STATUS_META,
  PLAN_SOURCE_META,
  PLAN_STATE_META,
  PLAN_STATE_TABS,
  PLAN_TRIMESTERS,
  TIER_OPTIONS,
} from "../../constants/subscription";
import { formatDate, formatDateTime } from "../../utils/datetime";
import { buildQuery } from "../../utils/ids";

const EMPTY_FILTERS = {
  tier: "",
  kind: "",
  trimester: "",
  paymentStatus: "",
  source: "",
  fromDate: "",
  toDate: "",
  sort: "createdAt:desc",
};

const SORT_OPTIONS = [
  { value: "createdAt:desc", label: "Newest first" },
  { value: "createdAt:asc", label: "Oldest first" },
  { value: "endDate:asc", label: "Ending soonest" },
  { value: "amountPaid:desc", label: "Highest paid" },
];

const PAGE_SIZES = [10, 20, 50];

const TH = "px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500 first:pl-4 last:pr-4";
const TD = "px-3 py-3 align-middle first:pl-4 last:pr-4";

export const PatientPlansPage = () => {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [state, setState] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [openPlanId, setOpenPlanId] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Everything except the state tab and the page: stats are counted over this,
  // so the tab counts move with the filters but not with the tab itself.
  const baseParams = useMemo(() => {
    const [sortBy, sortOrder] = filters.sort.split(":");
    return {
      search: search || undefined,
      tier: filters.tier || undefined,
      kind: filters.kind || undefined,
      trimester: filters.trimester || undefined,
      paymentStatus: filters.paymentStatus || undefined,
      source: filters.source || undefined,
      fromDate: filters.fromDate || undefined,
      toDate: filters.toDate || undefined,
      sortBy,
      sortOrder,
    };
  }, [search, filters]);

  const listParams = useMemo(
    () => ({ ...baseParams, state: state || undefined, page, limit }),
    [baseParams, state, page, limit],
  );

  const statsQuery = useGetQuery(
    `${API_ENDPOINTS.PATIENT_PLANS.STATS}${buildQuery(baseParams)}`,
    ["patient-plans-stats", baseParams],
    { placeholderData: keepPreviousData },
  );
  const listQuery = useGetQuery(
    `${API_ENDPOINTS.PATIENT_PLANS.LIST}${buildQuery(listParams)}`,
    ["patient-plans", listParams],
    { placeholderData: keepPreviousData },
  );

  const stats = statsQuery.data?.data;
  const list = listQuery.data?.data;
  const rows = list?.data || [];
  const total = list?.total || 0;

  const setFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  };

  const pickState = (next) => {
    setState(next);
    setPage(1);
  };

  const filtersActive =
    Boolean(search) ||
    Object.entries(filters).some(([key, value]) => key !== "sort" && value !== "");

  const clearFilters = () => {
    setSearchInput("");
    setSearch("");
    setFilters(EMPTY_FILTERS);
    setState("");
    setPage(1);
  };

  const tabs = [
    { key: "", label: "All", count: stats?.total },
    ...PLAN_STATE_TABS.filter((key) => key === state || stats?.byState?.[key]).map((key) => ({
      key,
      label: PLAN_STATE_META[key].label,
      count: stats?.byState?.[key],
    })),
  ];

  const from = total ? (page - 1) * limit + 1 : 0;
  const to = Math.min(page * limit, total);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Patient plans"
        subtitle="Every package and course patients have taken — paid, free and unfinished checkouts."
        actions={
          <Link
            to="/packages"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Layers size={16} aria-hidden="true" />
            Manage packages
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Plans taken"
          value={stats ? stats.total.toLocaleString("en-IN") : "—"}
          hint={filtersActive ? "Within current filters" : "All time"}
          icon={ReceiptText}
          tone="blue"
        />
        <StatCard
          label="Active now"
          value={stats ? stats.byState.ACTIVE.toLocaleString("en-IN") : "—"}
          hint="Running plans and courses"
          icon={CircleCheckBig}
          tone="green"
        />
        <StatCard
          label="Collected"
          value={stats ? formatAmount(stats.collected) : "—"}
          hint={stats ? `${stats.paidPlans} paid plan${stats.paidPlans === 1 ? "" : "s"}` : undefined}
          icon={IndianRupee}
          tone="purple"
        />
        <StatCard
          label={`Ending in ${stats?.expiringSoonDays || 7} days`}
          value={stats ? stats.expiringSoon.toLocaleString("en-IN") : "—"}
          hint="Due for a renewal reminder"
          icon={CalendarClock}
          tone="amber"
        />
      </div>

      <section className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">
        {/* Status tabs — counts follow the filters below */}
        <div className="flex gap-1 overflow-x-auto border-b border-gray-100 px-3 pt-3" role="tablist" aria-label="Plan status">
          {tabs.map((tab) => {
            const active = state === tab.key;
            return (
              <button
                key={tab.key || "all"}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => pickState(tab.key)}
                className={`-mb-px inline-flex shrink-0 items-center gap-2 whitespace-nowrap border-b-2 px-3 pb-3 pt-1 text-sm font-medium transition-colors ${
                  active
                    ? "border-blue-600 text-blue-700"
                    : "border-transparent text-gray-500 hover:text-gray-800"
                }`}
              >
                {tab.label}
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                    active ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {typeof tab.count === "number" ? tab.count : "…"}
                </span>
              </button>
            );
          })}
        </div>

        {/* Filters */}
        <div className="space-y-3 border-b border-gray-100 bg-gray-50/60 p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
            <label className="block flex-1">
              <span className="mb-1.5 block text-xs font-medium text-gray-600">Search</span>
              <span className="relative block">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  aria-hidden="true"
                />
                <input
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Patient name, phone, email, plan or subscription number"
                  className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </span>
            </label>
            <Select
              label="Sort"
              value={filters.sort}
              onChange={(event) => setFilter("sort", event.target.value)}
              className="lg:w-48"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
            <Select label="Tier" value={filters.tier} onChange={(event) => setFilter("tier", event.target.value)}>
              <option value="">All tiers</option>
              {TIER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            <Select label="Type" value={filters.kind} onChange={(event) => setFilter("kind", event.target.value)}>
              <option value="">All types</option>
              {PLAN_KIND_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            <Select
              label="Trimester"
              value={filters.trimester}
              onChange={(event) => setFilter("trimester", event.target.value)}
            >
              <option value="">Any trimester</option>
              {Object.values(PLAN_TRIMESTERS).map((value) => (
                <option key={value} value={value}>
                  {trimesterLabel(value)}
                </option>
              ))}
            </Select>
            <Select
              label="Payment"
              value={filters.paymentStatus}
              onChange={(event) => setFilter("paymentStatus", event.target.value)}
            >
              <option value="">Any payment</option>
              {Object.entries(PLAN_PAYMENT_STATUS_META).map(([value, meta]) => (
                <option key={value} value={value}>
                  {meta.label}
                </option>
              ))}
            </Select>
            <Select label="Source" value={filters.source} onChange={(event) => setFilter("source", event.target.value)}>
              <option value="">Any source</option>
              {Object.entries(PLAN_SOURCE_META).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-gray-600">Taken from</span>
              <input
                type="date"
                value={filters.fromDate}
                max={filters.toDate || undefined}
                onChange={(event) => setFilter("fromDate", event.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-gray-600">Taken to</span>
              <input
                type="date"
                value={filters.toDate}
                min={filters.fromDate || undefined}
                onChange={(event) => setFilter("toDate", event.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>
          </div>

          {filtersActive || state ? (
            <button
              type="button"
              onClick={clearFilters}
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              Clear all filters
            </button>
          ) : null}
        </div>

        {/* Table */}
        {listQuery.isPending ? (
          <SkeletonRows rows={6} />
        ) : listQuery.isError && !list ? (
          <EmptyState
            icon={ReceiptText}
            title="Could not load plans"
            message={listQuery.error?.response?.data?.message || "Please try again."}
            action={<Button onClick={() => listQuery.refetch()}>Try again</Button>}
          />
        ) : !rows.length ? (
          <EmptyState
            icon={ReceiptText}
            title="No plans match"
            message={
              filtersActive || state
                ? "Nothing matches these filters. Try widening them."
                : "No patient has taken a plan yet."
            }
            action={
              filtersActive || state ? (
                <Button variant="secondary" onClick={clearFilters}>
                  Clear filters
                </Button>
              ) : null
            }
          />
        ) : (
          <div
            className={`overflow-x-auto transition-opacity ${listQuery.isPlaceholderData ? "opacity-60" : ""}`}
            aria-busy={listQuery.isPlaceholderData}
          >
            <table className="w-full min-w-[900px] text-sm">
              <thead className="border-b border-gray-100 bg-gray-50/70">
                <tr>
                  <th className={TH}>Plan no.</th>
                  <th className={TH}>Patient</th>
                  <th className={TH}>Plan</th>
                  <th className={TH}>Period</th>
                  <th className={`${TH} text-right`}>Amount</th>
                  <th className={TH}>Status</th>
                  <th className={TH}>
                    <span className="sr-only">Details</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((row) => {
                  const stateMeta = PLAN_STATE_META[row.state] || { label: row.state, tone: "slate" };
                  const paymentMeta = PLAN_PAYMENT_STATUS_META[row.paymentStatus] || {
                    label: row.paymentStatus,
                    tone: "slate",
                  };
                  return (
                    <tr key={row._id} className="hover:bg-gray-50/60">
                      <td className={TD}>
                        <button
                          type="button"
                          onClick={() => setOpenPlanId(row._id)}
                          className="whitespace-nowrap font-semibold tabular-nums text-gray-900 hover:text-blue-600"
                        >
                          {row.subscriptionNumber}
                        </button>
                        <p className="whitespace-nowrap text-xs text-gray-500">{formatDateTime(row.createdAt)}</p>
                      </td>
                      <td className={TD}>
                        <div className="flex min-w-0 items-center gap-3">
                          <Avatar src={row.patient?.image} name={row.patient?.fullName || ""} size="sm" />
                          <div className="min-w-0">
                            {row.patient?.userId ? (
                              <Link
                                to={`/patients/${row.patient.userId}`}
                                className="block max-w-[180px] truncate font-semibold text-gray-900 hover:text-blue-600"
                              >
                                {row.patient.fullName || "Unnamed patient"}
                              </Link>
                            ) : (
                              <p className="max-w-[180px] truncate font-semibold text-gray-900">
                                {row.patient?.fullName || "Deleted patient"}
                              </p>
                            )}
                            <p className="truncate text-xs text-gray-500">{row.patient?.phone || "—"}</p>
                          </div>
                        </div>
                      </td>
                      <td className={TD}>
                        <p className="max-w-[220px] truncate font-medium text-gray-900" title={row.planName}>
                          {row.planName || "—"}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                          <Pill tone={TIER_TONE[row.tier] || "slate"}>{tierLabel(row.tier)}</Pill>
                          <span className="text-xs text-gray-500">{trimesterLabel(row.trimester)}</span>
                        </div>
                      </td>
                      <td className={`${TD} whitespace-nowrap`}>
                        {row.startDate ? (
                          <>
                            <p className="text-gray-900">
                              {formatDate(row.startDate)} – {row.endDate ? formatDate(row.endDate) : "—"}
                            </p>
                            {row.state === "ACTIVE" ? (
                              <p className="text-xs text-gray-500">{periodNote(row.endDate)}</p>
                            ) : null}
                          </>
                        ) : (
                          <span className="text-gray-400">Not started</span>
                        )}
                      </td>
                      <td className={`${TD} whitespace-nowrap text-right`}>
                        <p className="font-semibold tabular-nums text-gray-900">
                          {formatAmount(row.amountPaid)}
                          {row.amountPayable !== row.amountPaid ? (
                            <span className="ml-1 text-xs font-normal text-gray-500">
                              of {formatAmount(row.amountPayable)}
                            </span>
                          ) : null}
                        </p>
                        <span className="mt-1 inline-block">
                          <Pill tone={paymentMeta.tone}>{paymentMeta.label}</Pill>
                        </span>
                      </td>
                      <td className={`${TD} whitespace-nowrap`}>
                        <span title={stateMeta.hint}>
                          <Pill tone={stateMeta.tone}>{stateMeta.label}</Pill>
                        </span>
                      </td>
                      <td className={`${TD} w-12 text-right`}>
                        <button
                          type="button"
                          onClick={() => setOpenPlanId(row._id)}
                          aria-label={`View ${row.subscriptionNumber}`}
                          title="View details"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-blue-600"
                        >
                          <ChevronRight size={18} aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {total ? (
          <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-500">
              Showing {from}–{to} of {total.toLocaleString("en-IN")}
            </p>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-600">
                Per page
                <select
                  value={limit}
                  onChange={(event) => {
                    setLimit(Number(event.target.value));
                    setPage(1);
                  }}
                  className="rounded-lg border border-gray-300 px-2 py-1 text-sm"
                >
                  {PAGE_SIZES.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </label>
              {list.totalPages > 1 ? (
                <Pagination currentPage={page} totalPages={list.totalPages} onPageChange={setPage} />
              ) : null}
            </div>
          </div>
        ) : null}
      </section>

      {openPlanId ? (
        <PlanDetailModal planId={openPlanId} onClose={() => setOpenPlanId(null)} />
      ) : null}
    </div>
  );
};
