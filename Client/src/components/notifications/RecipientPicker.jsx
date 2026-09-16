import { useEffect, useMemo, useState } from "react";
import { Search, UserPlus, Users, X } from "lucide-react";

import { useGetQuery } from "../../api/apiCall";
import API_ENDPOINTS from "../../api/apiEndpoint";
import { buildQuery } from "../../utils/ids";
import Pagination from "../UI/Pagination";
import { Avatar, Button, EmptyState, Pill, SkeletonRows } from "../UI/kit";

const ENDPOINTS = {
  PATIENTS: API_ENDPOINTS.PATIENTS.GET_ALL,
  DOCTORS: API_ENDPOINTS.DOCTORS.GET_ALL,
};

const PAGE_SIZE = 10;

const subtitleOf = (person, group) => {
  if (group === "DOCTORS") {
    return person.specialization || person.email || person.phone || "—";
  }
  return person.currentTrimester || person.email || person.phone || "—";
};

/**
 * Searchable, paginated multi-select over a `/get-all` list.
 *
 * Selection is held by the parent and keyed on `_id`, so a recipient picked on
 * page 1 stays picked after paging or searching — the rows on screen are only
 * the current window into the list.
 *
 * Mount this with `key={group}`: switching between patients and doctors should
 * start from a clean search and page, which a remount gives for free.
 */
const RecipientPicker = ({ group, selected = [], onChange }) => {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const endpoint = useMemo(
    () =>
      `${ENDPOINTS[group] || ENDPOINTS.PATIENTS}${buildQuery({
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
        sortBy: "createdAt",
        sortOrder: "desc",
      })}`,
    [group, page, search],
  );

  const { data, isLoading, error } = useGetQuery(endpoint, [
    "notification-recipients",
    group,
    page,
    search,
  ]);

  const payload = data?.data;
  const rows = payload?.data || [];
  const totalPages = payload?.totalPages || 1;
  const total = payload?.total || 0;

  // These list endpoints answer 404 when the filter matches nothing
  const isEmpty =
    error?.response?.status === 404 || (!isLoading && !rows.length);
  const hasHardError = error && error?.response?.status !== 404;

  const selectedIds = useMemo(
    () => new Set(selected.map((person) => person._id)),
    [selected],
  );

  const toggle = (person) => {
    onChange(
      selectedIds.has(person._id)
        ? selected.filter((item) => item._id !== person._id)
        : [...selected, { ...person, __group: group }],
    );
  };

  const pageIds = rows.map((person) => person._id);
  const allOnPageSelected =
    pageIds.length > 0 && pageIds.every((id) => selectedIds.has(id));

  const togglePage = () => {
    if (allOnPageSelected) {
      onChange(selected.filter((person) => !pageIds.includes(person._id)));
      return;
    }

    const additions = rows
      .filter((person) => !selectedIds.has(person._id))
      .map((person) => ({ ...person, __group: group }));

    onChange([...selected, ...additions]);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search by name, email or phone"
            className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <Button
          variant="secondary"
          icon={UserPlus}
          onClick={togglePage}
          disabled={!rows.length}
        >
          {allOnPageSelected ? "Unselect page" : "Select page"}
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200">
        {isLoading ? (
          <SkeletonRows rows={4} />
        ) : hasHardError ? (
          <EmptyState
            icon={Users}
            title="Could not load the list"
            message={error?.response?.data?.message || error.message}
          />
        ) : isEmpty ? (
          <EmptyState
            icon={Users}
            title="No matches"
            message={
              search
                ? "Nothing matches that search."
                : "This list is empty right now."
            }
          />
        ) : (
          <ul className="divide-y divide-gray-100">
            {rows.map((person) => {
              const isPicked = selectedIds.has(person._id);

              return (
                <li key={person._id}>
                  <label className="flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-blue-50/40">
                    <input
                      type="checkbox"
                      checked={isPicked}
                      onChange={() => toggle(person)}
                      className="h-4 w-4 shrink-0 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Avatar
                      size="sm"
                      src={person.image}
                      name={person.fullName || "?"}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {person.fullName || "Unnamed"}
                      </p>
                      <p className="truncate text-xs text-gray-500">
                        {subtitleOf(person, group)}
                      </p>
                    </div>
                    <span className="hidden text-xs text-gray-500 sm:block">
                      {person.phone || person.email || "—"}
                    </span>
                    <Pill tone={person.isActive ? "green" : "slate"}>
                      {person.isActive ? "Active" : "Inactive"}
                    </Pill>
                  </label>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-gray-500">
          {total ? `${total} in this list` : "—"}
          {selected.length ? ` · ${selected.length} selected` : ""}
        </p>
        {totalPages > 1 ? (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        ) : null}
      </div>

      {selected.length ? (
        <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
              Selected ({selected.length})
            </p>
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-xs font-medium text-blue-700 hover:underline"
            >
              Clear all
            </button>
          </div>
          <div className="flex max-h-32 flex-wrap gap-1.5 overflow-y-auto">
            {selected.map((person) => (
              <span
                key={person._id}
                className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs text-gray-700 ring-1 ring-inset ring-blue-200"
              >
                {person.fullName || "Unnamed"}
                <button
                  type="button"
                  onClick={() =>
                    onChange(selected.filter((item) => item._id !== person._id))
                  }
                  className="text-gray-400 hover:text-red-600"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default RecipientPicker;
