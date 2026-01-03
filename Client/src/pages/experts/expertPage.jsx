import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Table from "../../components/UI/Table";
import { useGetQuery, useDeleteMutation } from "../../api/apiCall";
import API_ENDPOINTS from "../../api/apiEndpoint";
import Loader from "../../components/UI/Loader";
import NotFound from "../../components/UI/NotFound";
import { toast } from "react-hot-toast";
import Pagination from "../../components/UI/Pagination";
import { ExpertView } from "./expertView";
import { ExpertAddEdit } from "./expertAddEdit";

export const ExpertPage = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 20,
  });
  const navigate = useNavigate();

  const {
    data: categoryData,
    isLoading,
    error,
    refetch,
  } = useGetQuery(
    `${API_ENDPOINTS.CATEGORIES.GET_ALL.replace(
      "page=1",
      `page=${pagination.currentPage}`
    ).replace("limit=20", `limit=${pagination.limit}`)}`
  );
  console.log(categoryData, "category data from category page");

  const { mutate: deleteCategory, isLoading: isDeleting } = useDeleteMutation(
    API_ENDPOINTS.CATEGORIES.DELETE.replace(":id", "{id}")
  );

  useEffect(() => {
    if (categoryData?.data?.data) {
      const categoriesArray = categoryData.data.data;
      setCategories(categoriesArray);

      setPagination((prev) => ({
        ...prev,
        currentPage: categoryData.data.page,
        totalPages: categoryData.data.totalPages,
        totalItems: categoryData.data.total,
      }));
    }
  }, [categoryData]);

  const columns = [
    {
      key: "image",
      title: "Image",
      render: (category) => (
        <img
          src={category.image || "/images/default.png"}
          alt={category.title}
          className="w-16 h-16 object-cover rounded-md"
        />
      ),
    },
    {
      key: "title",
      title: "Title",
      render: (category) => <span>{category.name || "No Title"}</span>,
    },
    {
      key: "description",
      title: "Description",
      render: (category) => (
        <div className="max-w-xs truncate">
          {category.description || "No Description"}
        </div>
      ),
    },
    {
      key: "createdAt",
      title: "Created At",
      render: (category) =>
        category.createdAt
          ? new Date(category.createdAt).toLocaleDateString()
          : "N/A",
    },
    {
      key: "updatedAt",
      title: "Updated At",
      render: (category) =>
        category.updatedAt
          ? new Date(category.updatedAt).toLocaleDateString()
          : "N/A",
    },
  ];

  const handleView = (category) => {
    setSelectedCategory(category);
    setIsViewModalOpen(true);
  };

  const handleEdit = (category) => {
    navigate(`/categories/update/${category._id}`);
  };

  const handleDelete = (categoryToDelete) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      deleteCategory(categoryToDelete._id, {
        onSuccess: () => {
          toast.success("Category deleted successfully!");
          refetch();
        },
        onError: (error) => {
          toast.error(`Error deleting category: ${error.message}`);
        },
      });
    }
  };

  const handleAddNew = () => {
    navigate("/category/add");
  };

  const handleSave = () => {
    setIsAddEditModalOpen(false);
    refetch();
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
          title="No Experts Found"
          type="expert"
          message={notFoundMessage}
          actionText="Add New Expert"
          onAction={handleAddNew}
        />
      );
    }
    if (error && error?.response?.status !== 404) {
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
  }

  return (
    <div className="p-4">
      <Table
        title="Category Management"
        addButtonText="Create New Category"
        columns={columns}
        data={categories}
        onAddNew={handleAddNew}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isDeleting}
      />
      <div className="mt-4 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Showing {categories.length} of {pagination.totalItems} categories
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
        <ExpertView
          category={selectedCategory}
          onClose={() => setIsViewModalOpen(false)}
        />
      )}

      {isAddEditModalOpen && (
        <ExpertAddEdit
          category={selectedCategory}
          onSave={handleSave}
          onClose={() => setIsAddEditModalOpen(false)}
        />
      )}
    </div>
  );
};
