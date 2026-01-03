const CategoryView = ({ category, onClose }) => {
  if (!category) return null;
  return (
    <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Category Details</h2>
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
        <div className="space-y-4">
          {/* Image */}
          {category.image && (
            <div className="flex flex-col items-center">
              <img
                src={category.image}
                alt={category.name}
                className="max-h-48 object-contain rounded"
              />
            </div>
          )}
          {/* Title */}
          <div>
            <h3 className="text-sm font-medium text-gray-500">Title</h3>
            <p className="mt-1">{category.name}</p>
          </div>
          {/* Description */}
          <div>
            <h3 className="text-sm font-medium text-gray-500">Description</h3>
            <p className="mt-1">
              {category.description || "No description provided"}
            </p>
          </div>
          {/* Created At */}
          <div>
            <h3 className="text-sm font-medium text-gray-500">Created At</h3>
            <p className="mt-1">
              {category?.createdAt
                ? new Date(category.createdAt).toLocaleString()
                : "N/A"}
            </p>
          </div>
          {/* Updated At */}
          <div>
            <h3 className="text-sm font-medium text-gray-500">Updated At</h3>
            <p className="mt-1">
              {category?.updatedAt
                ? new Date(category.updatedAt).toLocaleString()
                : "N/A"}
            </p>
          </div>
        </div>
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

export default CategoryView;
