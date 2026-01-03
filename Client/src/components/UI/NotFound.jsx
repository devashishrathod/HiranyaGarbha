import {
  FaFolderOpen,
  FaUsers,
  FaTags,
  FaLightbulb,
  FaSearch,
} from "react-icons/fa";

const ICON_CONFIG = {
  category: {
    icon: <FaFolderOpen />,
    color: "text-blue-500",
  },
  user: {
    icon: <FaUsers />,
    color: "text-green-500",
  },
  subcategory: {
    icon: <FaTags />,
    color: "text-purple-500",
  },
  tips: {
    icon: <FaLightbulb />,
    color: "text-yellow-500",
  },
  default: {
    icon: <FaSearch />,
    color: "text-gray-400",
  },
};

const NotFound = ({
  title = "Not Found",
  message = "Not found",
  type = "default",
  actionText,
  onAction,
}) => {
  const { icon, color } = ICON_CONFIG[type] || ICON_CONFIG.default;

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className={`text-6xl mb-4 ${color}`}>{icon}</div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
      <p className="text-gray-600 mb-6 max-w-md">{message}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition"
        >
          + {actionText}
        </button>
      )}
    </div>
  );
};

export default NotFound;
