import { Link, useLocation } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();
  // Extract the actual user data from the nested structure
  const userData = user || {};
  // Enhanced icons with better medical/healthcare themed SVG paths
  const icons = {
    dashboard:
      "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    profile:
      "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
    users:
      "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0",
    //  lab: "M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2M7 4h10M7 4l-.5 14a2 2 0 002 2h7a2 2 0 002-2L17 4M9 9v6m6-6v6M12 9v6",
    doctors:
      "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
    // patients:
    //   "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
    // appointments:
    //   "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    categories: "M19 11H5m14-4H5m14 8H5m14-4H5",
    subcategories: "M4 6h16M4 10h16M4 14h16M4 18h16",
    // brands:
    //   "M7 4V2c0-.6.4-1 1-1h8c.6 0 1 .4 1 1v2M7 4h10m0 0v16a1 1 0 01-1 1H8a1 1 0 01-1-1V4",
    // banners:
    //   "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
    // packages: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
    // medicines:
    //   "M9 3v2m6-2v2M9 19v2m6-2v2M20 9H4m16 6H4m5-11h6a2 2 0 012 2v8a2 2 0 01-2 2H9a2 2 0 01-2-2V6a2 2 0 012-2z",
    // offers:
    //   "M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0H7m10 0l2 2-2 2m0-4h4m-4 0v4",
    // contact:
    //   "M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
    // enquiries:
    //   "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    // orders:
    //   "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01",
    // clinics:
    //   "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
    // tests:
    //   "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  };
  // Menu items based on user role with better organization
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
    // Add role-specific menu items based on the nested user.result.role
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
            name: "Card",
            path: "/card",
            icon: icons.doctors,
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
            color: "text-yellow-500",
          },
        ];
      // case "doctor":
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
      //     {
      //       name: "Patients",
      //       path: "/patients",
      //       icon: icons.patients,
      //       color: "text-green-600",
      //     },
      //     {
      //       name: "Lab",
      //       path: "/labs",
      //       icon: icons.lab,
      //       color: "text-purple-500",
      //     },
      //     {
      //       name: "Doctors",
      //       path: "/doctors",
      //       icon: icons.doctors,
      //       color: "text-blue-600",
      //     },
      //     {
      //       name: "Clinics",
      //       path: "/clinics",
      //       icon: icons.clinics,
      //       color: "text-red-600",
      //     },
      //   ];
      // case "lab":
      //   return [
      //     ...commonItems,
      //     {
      //       name: "Lab Tests",
      //       path: "/tests",
      //       icon: icons.tests,
      //       color: "text-purple-600",
      //     },
      //     {
      //       name: "Patients",
      //       path: "/labpatient",
      //       icon: icons.patients,
      //       color: "text-green-600",
      //     },
      //     {
      //       name: "Test List",
      //       path: "/testlist",
      //       icon: icons.lab,
      //       color: "text-purple-500",
      //     },
      //   ];
      default:
        return commonItems;
    }
  };

  const menuItems = getMenuItems();

  // For debugging
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
