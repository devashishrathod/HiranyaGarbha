import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

import Table from "../../components/UI/Table";
import Pagination from "../../components/UI/Pagination";
import Loader from "../../components/UI/Loader";
import NotFound from "../../components/UI/NotFound";

import { useDeleteMutation, useGetQuery } from "../../api/apiCall";
import API_ENDPOINTS from "../../api/apiEndpoint";
import formatGrammer from "../../utils/formatGrammer";
import { SubscriptionView } from "./SubscriptionView";

export const SubscriptionPage = () => {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [filterOpen, setFilterOpen] = useState(false);
  const [filtersDraft, setFiltersDraft] = useState({
    name: "",
    type: "",
    isActive: "",
    fromDate: "",
    toDate: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [filters, setFilters] = useState({
    name: "",
    type: "",
    isActive: "",
    fromDate: "",
    toDate: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 20,
  });

  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput.trim()), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  }, [debouncedSearch, filters]);

  const endpoint = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", String(pagination.currentPage));
    params.set("limit", String(pagination.limit));

    if (debouncedSearch) params.set("search", debouncedSearch);
    if (filters.name) params.set("name", filters.name);
    if (filters.type) params.set("type", filters.type);
    if (filters.isActive !== "") params.set("isActive", String(filters.isActive));
    if (filters.fromDate) params.set("fromDate", filters.fromDate);
    if (filters.toDate) params.set("toDate", filters.toDate);
    if (filters.sortBy) params.set("sortBy", filters.sortBy);
    if (filters.sortOrder) params.set("sortOrder", filters.sortOrder);

    return `${API_ENDPOINTS.SUBSCRIPTIONS.GET_ALL}?${params.toString()}`;
  }, [
    pagination.currentPage,
    pagination.limit,
    debouncedSearch,
    filters.name,
    filters.type,
    filters.isActive,
    filters.fromDate,
    filters.toDate,
    filters.sortBy,
    filters.sortOrder,
  ]);

  const {
    data: subscriptionsData,
    isLoading,
    error,
    refetch,
  } = useGetQuery(endpoint, [
    "subscriptions",
    pagination.currentPage,
    pagination.limit,
    debouncedSearch,
    filters,
  ]);

  const { mutate: deleteSubscription, isPending: isDeleting } = useDeleteMutation(
    API_ENDPOINTS.SUBSCRIPTIONS.DELETE,
  );

  useEffect(() => {
    const paged = subscriptionsData?.data;
    if (!paged) return;

    const rows = paged.data || [];
    setItems(Array.isArray(rows) ? rows : []);

    setPagination((prev) => ({
      ...prev,
      currentPage: paged.page || prev.currentPage,
      totalPages: paged.totalPages || prev.totalPages,
      totalItems: paged.total || prev.totalItems,
    }));
  }, [subscriptionsData]);

  const columns = [
    {
      key: "name",
      title: "Name",
      render: (row) => <span className="font-medium">{formatGrammer(row.name) || "-"}</span>,
    },
    {
      key: "type",
      title: "Type",
      render: (row) => <span className="text-sm">{formatGrammer(row.type) || "-"}</span>,
    },
    {
      key: "price",
      title: "Price",
      render: (row) => <span className="text-sm">{typeof row.price === "number" ? row.price : "-"}</span>,
    },
    {
      key: "durationInDays",
      title: "Duration (Days)",
      render: (row) => (
        <span className="text-sm">{typeof row.durationInDays === "number" ? row.durationInDays : "-"}</span>
      ),
    },
    {
      key: "isActive",
      title: "Status",
      render: (row) => (
        <span className="text-sm text-gray-800">{row?.isActive ? "Active" : "Inactive"}</span>
      ),
    },
    {
      key: "createdAt",
      title: "Created At",
      render: (row) =>
        row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "N/A",
    },
    {
      key: "updatedAt",
      title: "Updated At",
      render: (row) =>
        row.updatedAt ? new Date(row.updatedAt).toLocaleDateString() : "N/A",
    },
  ];

  const handleView = (row) => {
    setSelectedItem(row);
    setIsViewModalOpen(true);
  };

  const handleEdit = (row) => {
    navigate(`/subscriptions/update/${row._id}`);
  };

  const handleDelete = (row) => {
    if (!window.confirm("Are you sure you want to delete this subscription?")) return;

    deleteSubscription(row._id, {
      onSuccess: (res) => {
        toast.success(res?.message || "Subscription deleted successfully!");
        refetch();
      },
    });
  };

  const handleAddNew = () => {
    navigate("/subscriptions/add");
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({
      ...prev,
      currentPage: newPage,
    }));
  };

  const handleLimitChange = (newLimit) => {
    setPagination((prev) => ({
      ...prev,
      limit: newLimit,
      currentPage: 1,
    }));
  };

  const hasActiveFilters = useMemo(() => {
    if (debouncedSearch) return true;
    return Object.entries(filters).some(([k, v]) => {
      if (k === "sortBy" || k === "sortOrder") return false;
      return v !== "" && typeof v !== "undefined" && v !== null;
    });
  }, [debouncedSearch, filters]);

  const clearAllFilters = () => {
    setSearchInput("");
    setDebouncedSearch("");
    setFilters({
      name: "",
      type: "",
      isActive: "",
      fromDate: "",
      toDate: "",
      sortBy: "createdAt",
      sortOrder: "desc",
    });
    setFiltersDraft({
      name: "",
      type: "",
      isActive: "",
      fromDate: "",
      toDate: "",
      sortBy: "createdAt",
      sortOrder: "desc",
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader size={100} color="#3B82F6" className="text-center" />
      </div>
    );
  }

  if (error) {
    const notFoundMessage = error?.response?.data?.message || "Not found";
    if (error?.response?.status === 404) {
      return (
        <NotFound
          title="No Subscriptions Found"
          type="default"
          message={notFoundMessage}
          actionText="Create New Subscription"
          onAction={handleAddNew}
        />
      );
    }

    return (
      <div className="bg-red-100 p-4 rounded border border-red-300">
        <h3 className="text-red-500 font-bold">Something went wrong</h3>
        <p>{error.message}</p>
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
    <div className="p-4">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search subscriptions..."
            className="w-full sm:max-w-md border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setFiltersDraft(filters);
              setFilterOpen(true);
            }}
            className="inline-flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 text-sm hover:bg-gray-50"
            title="Filter"
          >
            <span>Filter</span>
          </button>
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-sm text-blue-600 hover:underline"
            >
              Clear filters
            </button>
          ) : null}
        </div>
      </div>

      {filterOpen ? (
        <div className="mb-4 border rounded-lg bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600">Name</label>
              <input
                value={filtersDraft.name}
                onChange={(e) =>
                  setFiltersDraft((p) => ({ ...p, name: e.target.value }))
                }
                className="mt-1 w-full border rounded px-2 py-2 text-sm"
                placeholder="Name"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600">Type</label>
              <select
                value={filtersDraft.type}
                onChange={(e) =>
                  setFiltersDraft((p) => ({ ...p, type: e.target.value }))
                }
                className="mt-1 w-full border rounded px-2 py-2 text-sm"
              >
                <option value="">Any</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="half_yearly">Half Yearly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600">Is Active</label>
              <select
                value={filtersDraft.isActive}
                onChange={(e) =>
                  setFiltersDraft((p) => ({ ...p, isActive: e.target.value }))
                }
                className="mt-1 w-full border rounded px-2 py-2 text-sm"
              >
                <option value="">Any</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600">From Date</label>
              <input
                type="date"
                value={filtersDraft.fromDate}
                onChange={(e) =>
                  setFiltersDraft((p) => ({ ...p, fromDate: e.target.value }))
                }
                className="mt-1 w-full border rounded px-2 py-2 text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600">To Date</label>
              <input
                type="date"
                value={filtersDraft.toDate}
                onChange={(e) =>
                  setFiltersDraft((p) => ({ ...p, toDate: e.target.value }))
                }
                className="mt-1 w-full border rounded px-2 py-2 text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600">Sort</label>
              <div className="mt-1 flex gap-2">
                <select
                  value={filtersDraft.sortBy}
                  onChange={(e) =>
                    setFiltersDraft((p) => ({ ...p, sortBy: e.target.value }))
                  }
                  className="w-full border rounded px-2 py-2 text-sm"
                >
                  <option value="createdAt">Created At</option>
                  <option value="updatedAt">Updated At</option>
                  <option value="name">Name</option>
                  <option value="price">Price</option>
                </select>
                <select
                  value={filtersDraft.sortOrder}
                  onChange={(e) =>
                    setFiltersDraft((p) => ({ ...p, sortOrder: e.target.value }))
                  }
                  className="w-full border rounded px-2 py-2 text-sm"
                >
                  <option value="desc">Desc</option>
                  <option value="asc">Asc</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setFiltersDraft({
                  name: "",
                  type: "",
                  isActive: "",
                  fromDate: "",
                  toDate: "",
                  sortBy: "createdAt",
                  sortOrder: "desc",
                });
              }}
              className="px-4 py-2 rounded border text-sm hover:bg-gray-50"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={() => {
                setFilters(filtersDraft);
                setFilterOpen(false);
              }}
              className="px-4 py-2 rounded bg-blue-600 text-white text-sm hover:bg-blue-700"
            >
              Done
            </button>
          </div>
        </div>
      ) : null}

      <Table
        title="Subscriptions"
        addButtonText="Create New Subscription"
        columns={columns}
        data={items}
        onAddNew={handleAddNew}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isDeleting}
      />

      <div className="mt-4 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Showing {items.length} of {pagination.totalItems} records
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label htmlFor="limit" className="text-sm font-medium">
              Items per page:
            </label>
            <select
              id="limit"
              value={pagination.limit}
              onChange={(e) => handleLimitChange(Number(e.target.value))}
              className="border rounded px-2 py-1 text-sm"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      {isViewModalOpen && (
        <SubscriptionView
          subscriptionId={selectedItem?._id}
          onClose={() => setIsViewModalOpen(false)}
        />
      )}
    </div>
  );
};
