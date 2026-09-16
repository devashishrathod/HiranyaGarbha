import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BadgeCheck,
  Eye,
  IndianRupee,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Stethoscope,
  Trash2,
} from "lucide-react";
import { toast } from "react-hot-toast";

import { useApiMutation, useGetQuery } from "../../api/apiCall";
import API_ENDPOINTS from "../../api/apiEndpoint";
import Pagination from "../../components/UI/Pagination";
import {
  Avatar,
  Button,
  EmptyState,
  Input,
  PageHeader,
  Pill,
  SectionCard,
  Select,
} from "../../components/UI/kit";
import { buildQuery, withPath } from "../../utils/ids";
import DoctorFormModal from "./DoctorFormModal";

const DEFAULT_FILTERS = {
  isActive: "",
  fromDate: "",
  toDate: "",
  sortBy: "createdAt",
  sortOrder: "desc",
};

const DoctorCardSkeleton = () => (
  <div className="animate-pulse rounded-2xl border border-gray-200/80 bg-white p-5">
    <div className="flex items-center gap-4">
      <div className="h-16 w-16 rounded-full bg-gray-200" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-2/3 rounded bg-gray-200" />
        <div className="h-3 w-1/2 rounded bg-gray-100" />
      </div>
    </div>
    <div className="mt-5 space-y-2">
      <div className="h-3 w-full rounded bg-gray-100" />
      <div className="h-3 w-4/5 rounded bg-gray-100" />
    </div>
  </div>
);

export const DoctorsPage = () => {
  const navigate = useNavigate();

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [draft, setDraft] = useState(DEFAULT_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [page, setPage] = useState(1);
  const [limit] = useState(12);

  const [formDoctor, setFormDoctor] = useState(null);
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const endpoint = useMemo(
    () =>
      `${API_ENDPOINTS.DOCTORS.GET_ALL}${buildQuery({
        page,
        limit,
        search: search || undefined,
        isActive: filters.isActive || undefined,
        fromDate: filters.fromDate || undefined,
        toDate: filters.toDate || undefined,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      })}`,
    [page, limit, search, filters],
  );

  const { data, isLoading, isFetching, error, refetch } = useGetQuery(endpoint, [
    "doctors",
    page,
    limit,
    search,
    filters,
  ]);

  const { mutate: removeDoctor, isPending: isDeleting } = useApiMutation({
    method: "delete",
  });

  const payload = data?.data;
  const rows = payload?.data || [];
  const total = payload?.total || 0;
  const totalPages = payload?.totalPages || 1;

  // The list endpoint answers 404 when the filter matches nothing
  const isEmpty = error?.response?.status === 404 || (!isLoading && !rows.length);
  const hasHardError = error && error?.response?.status !== 404;

  const activeFilterCount = Object.entries(filters).filter(
    ([key, value]) => !["sortBy", "sortOrder"].includes(key) && value !== "",
  ).length;

  const resetAll = () => {
    setSearchInput("");
    setSearch("");
    setFilters(DEFAULT_FILTERS);
    setDraft(DEFAULT_FILTERS);
    setPage(1);
  };

  const openCreate = () => {
    setFormDoctor(null);
    setFormOpen(true);
  };

  const handleDelete = (doctor) => {
    if (
      !window.confirm(
        `Delete ${doctor.fullName || "this doctor"}? Their profile and login will be deactivated.`,
      )
    ) {
      return;
    }

    removeDoctor(
      { url: withPath(API_ENDPOINTS.DOCTORS.DELETE, { id: doctor._id }) },
      {
        onSuccess: (res) => {
          toast.success(res?.message || "Doctor deleted");
          refetch();
        },
      },
    );
  };

  const renderGrid = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <DoctorCardSkeleton key={index} />
          ))}
        </div>
      );
    }

    if (hasHardError) {
      return (
        <EmptyState
          icon={Stethoscope}
          title="Could not load doctors"
          message={error?.response?.data?.message || error.message}
          action={
            <Button variant="secondary" icon={RotateCcw} onClick={() => refetch()}>
              Try again
            </Button>
          }
        />
      );
    }

    if (isEmpty) {
      return (
        <EmptyState
          icon={Stethoscope}
          title="No doctors found"
          message={
            search || activeFilterCount
              ? "Nothing matches your search and filters."
              : "Add your first doctor to start scheduling appointments."
          }
          action={
            search || activeFilterCount ? (
              <Button variant="secondary" onClick={resetAll}>
                Clear filters
              </Button>
            ) : (
              <Button icon={Plus} onClick={openCreate}>
                Add new doctor
              </Button>
            )
          }
        />
      );
    }

    return (
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {rows.map((doctor) => (
          <article
            key={doctor._id}
            onClick={() => navigate(`/doctors/${doctor.userId}`)}
            className="group cursor-pointer rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
          >
            <div className="flex items-start gap-4">
              <Avatar size="lg" src={doctor.image} name={doctor.fullName || "?"} />

              <div className="min-w-0 flex-1">
                <h3 className="truncate font-semibold text-gray-900">
                  {doctor.fullName || "Unnamed doctor"}
                </h3>
                <p className="truncate text-sm text-gray-600">
                  {doctor.specialization || "Specialization not set"}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Pill tone={doctor.isActive ? "green" : "slate"}>
                    {doctor.isActive ? "Active" : "Inactive"}
                  </Pill>
                  {doctor.isProfileCompleted ? (
                    <Pill tone="blue">
                      <BadgeCheck size={12} /> Verified
                    </Pill>
                  ) : (
                    <Pill tone="amber">Profile incomplete</Pill>
                  )}
                </div>
              </div>
            </div>

            <dl className="mt-5 space-y-2 border-t border-gray-100 pt-4 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-gray-500">Experience</dt>
                <dd className="truncate text-gray-900">
                  {doctor.experience || "—"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-gray-500">Qualifications</dt>
                <dd className="truncate text-gray-900">
                  {doctor.qualifications || "—"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-gray-500">Consultation fee</dt>
                <dd className="inline-flex items-center gap-0.5 text-gray-900">
                  <IndianRupee size={13} />
                  {doctor.consultationFee || 0}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-gray-500">Contact</dt>
                <dd className="truncate text-gray-900">
                  {doctor.phone || doctor.email || "—"}
                </dd>
              </div>
            </dl>

            <div
              className="mt-4 flex items-center justify-end gap-1 border-t border-gray-100 pt-3"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                title="View profile"
                onClick={() => navigate(`/doctors/${doctor.userId}`)}
                className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
              >
                <Eye size={17} />
              </button>
              <button
                type="button"
                title="Edit"
                onClick={() => {
                  setFormDoctor(doctor);
                  setFormOpen(true);
                }}
                className="rounded-lg p-2 text-amber-600 hover:bg-amber-50"
              >
                <Pencil size={17} />
              </button>
              <button
                type="button"
                title="Delete"
                disabled={isDeleting}
                onClick={() => handleDelete(doctor)}
                className="rounded-lg p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                <Trash2 size={17} />
              </button>
            </div>
          </article>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <PageHeader
        title="Doctors"
        subtitle="Manage doctor profiles, weekly availability and appointments."
        actions={
          <Button icon={Plus} onClick={openCreate}>
            Add new doctor
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search by name, email or phone..."
            className="w-full rounded-lg border border-gray-300 py-2.5 pl-9 pr-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <Button
          variant="secondary"
          icon={SlidersHorizontal}
          onClick={() => {
            setDraft(filters);
            setFiltersOpen((previous) => !previous);
          }}
        >
          Filters
          {activeFilterCount ? (
            <span className="ml-1 rounded-full bg-blue-100 px-1.5 text-xs font-semibold text-blue-700">
              {activeFilterCount}
            </span>
          ) : null}
        </Button>

        {search || activeFilterCount ? (
          <Button variant="ghost" onClick={resetAll}>
            Clear
          </Button>
        ) : null}
      </div>

      {filtersOpen ? (
        <SectionCard title="Filters">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Select
              label="Status"
              value={draft.isActive}
              onChange={(event) =>
                setDraft((previous) => ({
                  ...previous,
                  isActive: event.target.value,
                }))
              }
            >
              <option value="">Any</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </Select>

            <Input
              label="Added from"
              type="date"
              value={draft.fromDate}
              onChange={(event) =>
                setDraft((previous) => ({
                  ...previous,
                  fromDate: event.target.value,
                }))
              }
            />

            <Input
              label="Added to"
              type="date"
              value={draft.toDate}
              onChange={(event) =>
                setDraft((previous) => ({
                  ...previous,
                  toDate: event.target.value,
                }))
              }
            />

            <Select
              label="Sort by"
              value={draft.sortBy}
              onChange={(event) =>
                setDraft((previous) => ({
                  ...previous,
                  sortBy: event.target.value,
                }))
              }
            >
              <option value="createdAt">Date added</option>
              <option value="updatedAt">Last updated</option>
              <option value="fullName">Name</option>
              <option value="consultationFee">Consultation fee</option>
            </Select>

            <Select
              label="Order"
              value={draft.sortOrder}
              onChange={(event) =>
                setDraft((previous) => ({
                  ...previous,
                  sortOrder: event.target.value,
                }))
              }
            >
              <option value="desc">Newest first</option>
              <option value="asc">Oldest first</option>
            </Select>
          </div>

          <div className="mt-5 flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setDraft(DEFAULT_FILTERS)}>
              Reset
            </Button>
            <Button
              onClick={() => {
                setFilters(draft);
                setPage(1);
                setFiltersOpen(false);
              }}
            >
              Apply filters
            </Button>
          </div>
        </SectionCard>
      ) : null}

      <div className={isFetching && !isLoading ? "opacity-60 transition" : ""}>
        {renderGrid()}
      </div>

      {!isEmpty && !hasHardError ? (
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-xs text-gray-500">
            Showing {rows.length} of {total} doctors
          </p>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      ) : null}

      {formOpen ? (
        <DoctorFormModal
          doctor={formDoctor}
          onClose={() => setFormOpen(false)}
          onSaved={refetch}
        />
      ) : null}
    </div>
  );
};

export default DoctorsPage;
