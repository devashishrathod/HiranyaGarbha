import { Link, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import {
  Bell,
  CalendarDays,
  ChevronRight,
  FileText,
  FolderTree,
  Footprints,
  HeartHandshake,
  Image,
  LayoutDashboard,
  ListTree,
  MessageSquareText,
  Package,
  ReceiptText,
  ShieldCheck,
  ShoppingBag,
  Stethoscope,
  Users,
  X,
} from "lucide-react";
// Icons for the menu items that are hidden below — import them again when an
// item is switched back on:
// CreditCard (Subscriptions), CircleHelp (FAQ),
// GraduationCap (Experts), Lightbulb (Tips), CalendarHeart (Trimester Plans),
// Apple (Nutrition Plans), UtensilsCrossed (Meal Plans), Flower2 (Wellness),
// Music (Musics), Zap (Daily Motivation), Hospital (Hospitals), FlaskConical (Labs)
import useAuth from "../../hooks/useAuth";

/*
 * The menu, grouped the way an admin works: running the clinic, money,
 * talking to patients, then the content and legal pages that change rarely.
 *
 * Profile is not a menu item: it opens from the user card at the bottom of
 * this sidebar and from the account menu in the header.
 */
const ADMIN_MENU = [
  {
    title: "Overview",
    items: [
      { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
      { name: "Appointments", path: "/appointments", icon: CalendarDays },
      { name: "Patients", path: "/patients", icon: Users },
      { name: "Doctors", path: "/doctors", icon: Stethoscope },
      // Hidden for now — Hospitals and Labs are not ready yet
      // { name: "Hospitals", path: "/hospitals", icon: Hospital },
      // { name: "Labs", path: "/labs", icon: FlaskConical },
    ],
  },
  {
    title: "Revenue",
    items: [
      { name: "Patient Plans", path: "/patient-plans", icon: ReceiptText },
      { name: "Packages", path: "/packages", icon: Package },
      // Hidden for now — Packages covers add / edit / delete. The table view
      // and its /subscriptions/add and /subscriptions/update/:id routes stay.
      // { name: "Subscriptions", path: "/subscriptions", icon: CreditCard },
    ],
  },
  {
    title: "Engagement",
    items: [
      { name: "Notifications", path: "/notifications", icon: Bell },
      { name: "Contact Inquiries", path: "/contact-inquiries", icon: MessageSquareText },
      // Hidden for now — Daily Motivation is not ready yet
      // { name: "Daily Motivation", path: "/daily-motivation", icon: Zap },
    ],
  },
  {
    title: "Content",
    items: [
      { name: "Categories", path: "/category", icon: FolderTree },
      { name: "Subcategories", path: "/subcategories", icon: ListTree },
      { name: "Prenatal Care Services", path: "/prenatal-cares", icon: HeartHandshake },
      { name: "Products", path: "/products", icon: ShoppingBag },
      { name: "Gallery", path: "/gallery", icon: Image },
      // Hidden for now — FAQ is not ready yet
      // { name: "FAQ", path: "/faq", icon: CircleHelp },
      // Hidden for now — Experts and Tips are not ready yet
      // { name: "Experts", path: "/experts", icon: GraduationCap },
      // { name: "Tips", path: "/tips", icon: Lightbulb },
      // Hidden for now — Trimester Plans and Nutrition Plans are not ready yet
      // { name: "Pregnancy Trimester Plans", path: "/trimester", icon: CalendarHeart },
      // { name: "Nutrition Plans", path: "/nutritions", icon: Apple },
      // Hidden for now — Meal Plans and Wellness are not ready yet
      // { name: "Meal Plans", path: "/meal-plans", icon: UtensilsCrossed },
      // { name: "Wellness & Mindfulness", path: "/wellness-mindfulness", icon: Flower2 },
      // Hidden for now — Musics is not ready yet
      // { name: "Musics", path: "/musics", icon: Music },
    ],
  },
  {
    title: "Legal",
    items: [
      { name: "Privacy & Policies", path: "/privacies", icon: ShieldCheck },
      { name: "Terms & Conditions", path: "/terms", icon: FileText },
    ],
  },
];

// Every role sees at least this.
const COMMON_MENU = [
  {
    title: null,
    items: [{ name: "Dashboard", path: "/dashboard", icon: LayoutDashboard }],
  },
];

const menuForRole = (role) => {
  switch (role) {
    case "admin":
      return ADMIN_MENU;
    // case "staff":
    //   return [
    //     ...COMMON_MENU,
    //     {
    //       title: "Clinic",
    //       items: [
    //         { name: "Patients", path: "/patients", icon: Users },
    //         { name: "Appointments", path: "/appointments", icon: CalendarDays },
    //       ],
    //     },
    //   ];
    // case "receptionist":
    //   return [
    //     ...COMMON_MENU,
    //     {
    //       title: "Clinic",
    //       items: [{ name: "Appointments", path: "/appointments", icon: CalendarDays }],
    //     },
    //   ];
    default:
      return COMMON_MENU;
  }
};

// Keep the parent item highlighted on detail routes like /patients/:id
const isActivePath = (pathname, path) =>
  pathname === path || pathname.startsWith(`${path}/`);

const Sidebar = ({ mobileSidebarOpen, setMobileSidebarOpen }) => {
  const location = useLocation();
  const { user } = useAuth();
  const userData = user || {};
  const role = userData?.role || "";
  const roleLabel = role ? `${role.charAt(0).toUpperCase()}${role.slice(1)}` : "User";

  const menu = menuForRole(role);
  const closeOnMobile = () => setMobileSidebarOpen(false);
  const onProfile = location.pathname === "/profile";

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-gray-200 bg-white shadow-xl transition-transform duration-300 ease-in-out lg:translate-x-0 lg:shadow-none ${
        mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
      } lg:block`}
    >
      <div className="flex h-full flex-col">
        {/* Brand — same height as the header so their borders line up */}
        <div className="flex h-20 flex-shrink-0 items-center gap-3 border-b border-gray-200 px-5">
          <Link
            to="/dashboard"
            onClick={closeOnMobile}
            className="flex min-w-0 flex-1 items-center gap-3 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-sm">
              <Footprints size={22} aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-base font-bold leading-tight text-gray-900">
                Hiranyagarbh
              </span>
              <span className="block truncate text-xs text-gray-500">
                GarbhaSanskar · {roleLabel} panel
              </span>
            </span>
          </Link>

          <button
            type="button"
            onClick={closeOnMobile}
            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {/* Menu — scrolls on its own; brand and user card stay put */}
        <nav
          aria-label="Main"
          className="flex-1 space-y-6 overflow-y-auto px-3 py-5 [scrollbar-width:thin]"
        >
          {menu.map((group, index) => (
            <div key={group.title || index}>
              {group.title ? (
                <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  {group.title}
                </p>
              ) : null}
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isActivePath(location.pathname, item.path);
                  const Icon = item.icon;

                  return (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        onClick={closeOnMobile}
                        aria-current={active ? "page" : undefined}
                        className={`group relative flex min-h-[42px] items-center gap-3 rounded-xl px-3 text-sm transition-colors duration-150 ${
                          active
                            ? "bg-gradient-to-r from-blue-50 to-purple-50 font-semibold text-blue-700"
                            : "font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        {active ? (
                          <span
                            aria-hidden="true"
                            className="absolute inset-y-2 left-0 w-1 rounded-r-full bg-gradient-to-b from-blue-600 to-purple-600"
                          />
                        ) : null}
                        {Icon ? (
                          <Icon
                            size={18}
                            aria-hidden="true"
                            className={`flex-shrink-0 transition-colors ${
                              active ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"
                            }`}
                          />
                        ) : null}
                        <span className="truncate">{item.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* User card — opens the profile page */}
        <div className="flex-shrink-0 border-t border-gray-200 p-3">
          <Link
            to="/profile"
            onClick={closeOnMobile}
            aria-label="Open my profile"
            aria-current={onProfile ? "page" : undefined}
            className={`group flex items-center gap-3 rounded-xl p-2.5 transition-colors ${
              onProfile
                ? "bg-gradient-to-r from-blue-50 to-purple-50"
                : "hover:bg-gray-50"
            }`}
          >
            <span className="relative flex-shrink-0">
              {userData?.image ? (
                <img
                  src={userData.image}
                  alt=""
                  className="h-10 w-10 rounded-full object-cover ring-2 ring-white shadow-sm"
                />
              ) : (
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-sm font-bold text-white">
                  {userData?.name?.charAt(0).toUpperCase() || "U"}
                </span>
              )}
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-green-400" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold capitalize text-gray-900">
                {userData?.name || "User"}
              </span>
              <span className="block truncate text-xs text-gray-500">View profile</span>
            </span>
            <ChevronRight
              size={18}
              aria-hidden="true"
              className={`flex-shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 ${
                onProfile ? "text-blue-600" : "text-gray-400 group-hover:text-blue-600"
              }`}
            />
          </Link>
        </div>
      </div>
    </aside>
  );
};

Sidebar.propTypes = {
  mobileSidebarOpen: PropTypes.bool.isRequired,
  setMobileSidebarOpen: PropTypes.func.isRequired,
};

export default Sidebar;
