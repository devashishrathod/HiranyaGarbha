import { Link, useLocation } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();
  const userData = user || {};

  const icons = {
    dashboard:
      "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    profile:
      "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
    users:
      "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0",
    categories: "M19 11H5m14-4H5m14 8H5m14-4H5",
    subcategories: "M4 6h16M4 10h16M4 14h16M4 18h16",
    products: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
    enquiries:
      "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    prenatal_services:
      "M12 22s8-4 8-12a8 8 0 10-16 0c0 8 8 12 8 12zm0-10a4 4 0 110-8 4 4 0 010 8z",
    nutrition:
      "M12 3C7 3 3 7 3 12c0 3.87 3.13 7 7 7h4c3.87 0 7-3.13 7-7 0-5-4-9-9-9zm0 4a3 3 0 100 6 3 3 0 000-6z",
    meal_plans: "M4 6h16M4 10h16M4 14h16M4 18h16m-8-8v8",
    experts:
      "M17 20v-2a3 3 0 00-6 0v2m6 0H7v-2a3 3 0 016 0v2m-6 0H4v-2a5 5 0 0110 0v2",
    tips: "M12 3a6 6 0 014 10 4 4 0 01-1 3v2a1 1 0 01-1 1h-4a1 1 0 01-1-1v-2a4 4 0 01-1-3 6 6 0 014-10z",
    trimester_plans:
      "M12 21c4.418 0 8-3.582 8-8a8 8 0 10-13.856 5.856A8 8 0 0012 21zm0-9a3 3 0 110-6 3 3 0 010 6z",
    wellness:
      "M12 20c4 0 7-3 8-6-2-1-4-2-8-2s-6 1-8 2c1 3 4 6 8 6zm0-8a4 4 0 100-8 4 4 0 000 8z",
    gallery:
      "M4 5h16a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1zm3 3a2 2 0 114 0 2 2 0 01-4 0zm10 8l-4-5-3 4H7l5-6 5 7h-2z",
    privacy_policy:
      "M12 3l7 4v5c0 5-3.5 9.74-7 11-3.5-1.26-7-6-7-11V7l7-4zm0 4a3 3 0 00-3 3c0 1.3.84 2.4 2 2.82V15a1 1 0 002 0v-2.18A3 3 0 0015 10a3 3 0 00-3-3z",
    terms_conditions:
      "M6 2h9l5 5v13a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2zm8 1v5h5M8 11h8M8 15h8M8 19h5",
  };

  const getMenuItems = () => {
    const commonItems = [
      {
        name: "Dashboard",
        path: "/dashboard",
        icon: icons.dashboard,
        color: "text-blue-500",
      },
      {
        name: "Profile",
        path: "/profile",
        icon: icons.profile,
        color: "text-green-500",
      },
    ];
    switch (userData?.role) {
      case "admin":
        return [
          ...commonItems,
          {
            name: "Users",
            path: "/users",
            icon: icons.users,
            color: "text-purple-500",
          },
          {
            name: "Experts",
            path: "/experts",
            icon: icons.experts,
            color: "text-yellow-500",
          },
          {
            name: "Tips",
            path: "/tips",
            icon: icons.tips,
            color: "text-blue-600",
          },
          {
            name: "Categories",
            path: "/category",
            icon: icons.categories,
            color: "text-orange-500",
          },
          {
            name: "Subcategories",
            path: "/subcategories",
            icon: icons.subcategories,
            color: "text-red-500",
          },
          {
            name: "Prenatal Care Services",
            path: "/prenatal-cares",
            icon: icons.prenatal_services,
            color: "text-pink-500",
          },
          {
            name: "Pregnancy Trimester Plans",
            path: "/trimester",
            icon: icons.trimester_plans,
            color: "text-green-500",
          },
          {
            name: "Nutrition Plans",
            path: "/nutritions",
            icon: icons.nutrition,
            color: "text-purple-500",
          },
          {
            name: "Meal Plans",
            path: "/meal-plans",
            icon: icons.meal_plans,
            color: "text-violet-500",
          },
          {
            name: "Wellness & Mindfulness",
            path: "/wellness-mindfulness",
            icon: icons.wellness,
            color: "text-indigo-500",
          },

          {
            name: "Products",
            path: "/products",
            icon: icons.products,
            color: "text-sky-500",
          },
          {
            name: "Contact Inquiries",
            path: "/contact-inquiries",
            icon: icons.enquiries,
            color: "text-emerald-500",
          },
          {
            name: "Gallery",
            path: "/gallery",
            icon: icons.gallery,
            color: "text-teal-500",
          },
          {
            name: "Privacy & Policies",
            path: "/privacies",
            icon: icons.privacy_policy,
            color: "text-blue-600",
          },
          {
            name: "Terms & Conditions",
            path: "/terms",
            icon: icons.terms_conditions,
            color: "text-sky-500",
          },
        ];
      // case "staff":
      // return [
      //   ...commonItems,
      //   {
      //     name: "Patients",
      //     path: "/patients",
      //     icon: icons.patients,
      //     color: "text-green-600",
      //   },
      //   {
      //     name: "Appointments",
      //     path: "/appointments",
      //     icon: icons.appointments,
      //     color: "text-blue-600",
      //   },
      // ];
      // case "receptionist":
      //   return [
      //     ...commonItems,
      //     {
      //       name: "Appointments",
      //       path: "/appointments",
      //       icon: icons.appointments,
      //       color: "text-blue-600",
      //     },
      //   ];
      default:
        return commonItems;
    }
  };

  const menuItems = getMenuItems();
  console.log("User object:", user);
  console.log("User data extracted:", userData);
  console.log("Role value:", userData?.role);

  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 bg-white border-r border-gray-200 shadow-lg lg:block">
      <div className="flex flex-col h-full">
        {/* Sidebar header - Logo area with enhanced design - FIXED */}
        <div className="flex-shrink-0 flex items-center justify-center h-20 px-6 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="flex items-center space-x-3">
            <div>
              <h1 className="text-xl font-bold text-white">
                Hiranyagarbh GarbhaSanskar
              </h1>
            </div>
          </div>
        </div>
        {/* Role badge - FIXED */}
        <div className="flex-shrink-0 px-6 py-4 bg-gray-50">
          <div className="inline-flex items-center px-3 py-1 text-xs font-medium text-white bg-gradient-to-r from-blue-500 to-purple-500 rounded-full">
            <div className="w-2 h-2 mr-2 bg-white rounded-full animate-pulse"></div>
            {userData?.role?.charAt(0).toUpperCase() +
              userData?.role?.slice(1) || "User"}{" "}
            Panel
          </div>
        </div>

        {/* Menu items with enhanced design - SCROLLABLE */}
        <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.name}
                to={item.path}
                className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-[1.02]"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 hover:scale-[1.01]"
                }`}
              >
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-lg mr-3 transition-all duration-200 ${
                    isActive
                      ? " bg-opacity-20"
                      : "bg-gray-100 group-hover:bg-gray-200"
                  }`}
                >
                  <svg
                    className={`w-5 h-5 transition-colors duration-200 ${
                      isActive ? "text-white" : item.color
                    }`}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={item.icon}
                    />
                  </svg>
                </div>
                <span className="flex-1">{item.name}</span>
                {isActive && (
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User info at bottom with enhanced design - FIXED */}
        <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center p-3 bg-white rounded-xl shadow-sm">
            <div className="relative">
              {userData?.image ? (
                <img
                  src={userData.image}
                  alt={userData.name}
                  className="w-12 h-12 rounded-full ring-2 ring-blue-500"
                />
              ) : (
                <div className="flex items-center justify-center w-12 h-12 text-white bg-gradient-to-r from-blue-500 to-purple-500 rounded-full">
                  <span className="text-lg font-bold">
                    {userData?.name?.charAt(0).toUpperCase() || "U"}
                  </span>
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-semibold text-gray-800">
                {userData?.name || "User"}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {userData?.role || "User"}
              </p>
            </div>
            <div className="text-gray-400 hover:text-gray-600 cursor-pointer">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
