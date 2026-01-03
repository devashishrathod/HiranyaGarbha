// import {
//   FaUserMd,
//   FaBaby,
//   FaBoxOpen,
//   FaAppleAlt,
//   FaEnvelopeOpenText,
//   FaImages,
//   FaUtensils,
//   FaCalendarAlt,
//   FaSpa,
//   FaBrain,
// } from "react-icons/fa";

// const ICON_CONFIG = {
//   category: {
//     icon: <FaFolderOpen />,
//     color: "text-blue-500",
//   },
//   user: {
//     icon: <FaUsers />,
//     color: "text-green-500",
//   },
//   subcategory: {
//     icon: <FaTags />,
//     color: "text-purple-500",
//   },
//   tips: {
//     icon: <FaLightbulb />,
//     color: "text-yellow-500",
//   },
//   experts: {
//     icon: <FaUserMd />,
//     color: "text-indigo-500",
//   },
//   prenatalServices: {
//     icon: <FaBaby />,
//     color: "text-pink-500",
//   },
//   products: {
//     icon: <FaBoxOpen />,
//     color: "text-orange-500",
//   },
//   nutritionPlans: {
//     icon: <FaAppleAlt />,
//     color: "text-green-600",
//   },
//   contactEnquiries: {
//     icon: <FaEnvelopeOpenText />,
//     color: "text-blue-600",
//   },
//   gallery: {
//     icon: <FaImages />,
//     color: "text-purple-600",
//   },
//   mealPlan: {
//     icon: <FaUtensils />,
//     color: "text-red-500",
//   },
//   trimester: {
//     icon: <FaCalendarAlt />,
//     color: "text-cyan-600",
//   },
//   wellness: {
//     icon: <FaSpa />,
//     color: "text-emerald-500",
//   },
//   mindfulness: {
//     icon: <FaBrain />,
//     color: "text-violet-600",
//   },
//   default: {
//     icon: <FaSearch />,
//     color: "text-gray-400",
//   },
// };

import {
  FaFolderOpen,
  FaUsers,
  FaUserMd,
  FaTags,
  FaBaby,
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
  expert: {
    icon: <FaUserMd />,
    color: "text-indigo-500",
  },
  prenatalServices: {
    icon: <FaBaby />,
    color: "text-pink-500",
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
