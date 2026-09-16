import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Trash2,
  Users,
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
  SkeletonRows,
} from "../../components/UI/kit";
import { buildQuery, withPath } from "../../utils/ids";
import { formatDate } from "../../utils/datetime";
import PatientFormModal from "./PatientFormModal";

const DEFAULT_FILTERS = {
  isActive: "",
  fromDate: "",
  toDate: "",
  sortBy: "createdAt",
  sortOrder: "desc",
};

export const PatientsPage = () => {
  const navigate = useNavigate();

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [draft, setDraft] = useState(DEFAULT_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const [formPatient, setFormPatient] = useState(null);
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
      `${API_ENDPOINTS.PATIENTS.GET_ALL}${buildQuery({
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
    "patients",
    page,
    limit,
    search,
    filters,
  ]);

  const { mutate: removePatient, isPending: isDeleting } = useApiMutation({
    method: "delete",
  });

  const payload = data?.data;
  const rows = payload?.data || [];
  const total = payload?.total || 0;
  const totalPages = payload?.totalPages || 1;

  // The list endpoint answers 404 when the filter matches nothing
  const isEmpty = error?.response?.status === 404 || (!isLoading && !rows.length);
  const hasHardError = error && error?.response?.status !== 404;

  const openCreate = () => {
    setFormPatient(null);
    setFormOpen(true);
  };

  const openEdit = (patient) => {
    setFormPatient(patient);
    setFormOpen(true);
  };

  const handleDelete = (patient) => {
    const label = patient.fullName || "this patient";
    if (
      !window.confirm(
        `Delete ${label}? Their profile and login will be deactivated.`,
      )
    ) {
      return;
    }

    removePatient(
      { url: withPath(API_ENDPOINTS.PATIENTS.DELETE, { id: patient._id }) },
      {
        onSuccess: (res) => {
          toast.success(res?.message || "Patient deleted");
          refetch();
        },
      },
    );
  };

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

  const renderTable = () => {
    if (isLoading) return <SkeletonRows rows={6} />;

    if (hasHardError) {
      return (
        <EmptyState
          icon={Users}
          title="Could not load patients"
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
          icon={Users}
          title="No patients found"
          message={
            search || activeFilterCount
              ? "Nothing matches your search and filters."
              : "Add your first patient to get started."
          }
          action={
            search || activeFilterCount ? (
              <Button variant="secondary" onClick={resetAll}>
                Clear filters
              </Button>
            ) : (
              <Button icon={Plus} onClick={openCreate}>
                Add new patient
              </Button>
            )
          }
        />
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-5 py-3">Patient</th>
              <th className="px-5 py-3">Contact</th>
              <th className="px-5 py-3">Profession</th>
              <th className="px-5 py-3">Pregnancy</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Added</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((patient) => (
              <tr
                key={patient._id}
                onClick={() => navigate(`/patients/${patient.userId}`)}
                className="cursor-pointer hover:bg-blue-50/40"
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar
                      size="sm"
                      src={patient.image}
                      name={patient.fullName || "?"}
                    />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-gray-900">
                        {patient.fullName || "Unnamed patient"}
                      </p>
                      <p className="truncate text-xs text-gray-500">
                        {patient.husbandOrParentName
                          ? `W/O · D/O ${patient.husbandOrParentName}`
                          : patient.email || "No email"}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-5 py-4">
                  <p className="text-gray-800">{patient.phone || "—"}</p>
                  <p className="text-xs text-gray-500">
                    {patient.whatsappNumber
                      ? `WhatsApp ${patient.whatsappNumber}`
                      : patient.bloodGroup
                        ? `Blood group ${patient.bloodGroup}`
                        : "—"}
                  </p>
                </td>

                <td className="px-5 py-4 text-gray-800">
                  {patient.profession || "—"}
                </td>

                <td className="px-5 py-4">
                  <p className="text-gray-800">
                    {patient.currentTrimester || "—"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {patient.edd ? `EDD ${formatDate(patient.edd)}` : "EDD not set"}
                  </p>
                </td>

                <td className="px-5 py-4">
                  <div className="flex flex-col items-start gap-1.5">
                    <Pill tone={patient.isActive ? "green" : "slate"}>
                      {patient.isActive ? "Active" : "Inactive"}
                    </Pill>
                    {!patient.isProfileCompleted ? (
                      <Pill tone="amber">Profile incomplete</Pill>
                    ) : null}
                  </div>
                </td>

                <td className="px-5 py-4 text-gray-600">
                  {formatDate(patient.createdAt)}
                </td>

                <td className="px-5 py-4">
                  <div
                    className="flex items-center justify-end gap-1"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <button
                      type="button"
                      title="View profile"
                      onClick={() => navigate(`/patients/${patient.userId}`)}
                      className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                    >
                      <Eye size={17} />
                    </button>
                    <button
                      type="button"
                      title="Edit"
                      onClick={() => openEdit(patient)}
                      className="rounded-lg p-2 text-amber-600 hover:bg-amber-50"
                    >
                      <Pencil size={17} />
                    </button>
                    <button
                      type="button"
                      title="Delete"
                      disabled={isDeleting}
                      onClick={() => handleDelete(patient)}
                      className="rounded-lg p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <PageHeader
        title="Patients"
        subtitle="Search patients, open a profile and manage their appointments."
        actions={
          <Button icon={Plus} onClick={openCreate}>
            Add new patient
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
            placeholder="Search by name, husband/parent, email, phone or WhatsApp..."
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
              <option value="edd">Expected due date</option>
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

      <SectionCard
        title="All patients"
        description={total ? `${total} patient${total === 1 ? "" : "s"}` : undefined}
        bodyClassName=""
      >
        <div className={isFetching && !isLoading ? "opacity-60 transition" : ""}>
          {renderTable()}
        </div>

        {!isEmpty && !hasHardError ? (
          <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>
                Showing {rows.length} of {total}
              </span>
              <select
                value={limit}
                onChange={(event) => {
                  setLimit(Number(event.target.value));
                  setPage(1);
                }}
                className="rounded border border-gray-300 px-2 py-1 text-xs"
              >
                {[10, 20, 50, 100].map((option) => (
                  <option key={option} value={option}>
                    {option} / page
                  </option>
                ))}
              </select>
            </div>

            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        ) : null}
      </SectionCard>

      {formOpen ? (
        <PatientFormModal
          patient={formPatient}
          onClose={() => setFormOpen(false)}
          onSaved={refetch}
        />
      ) : null}
    </div>
  );
};

export default PatientsPage;
