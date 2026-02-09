import { lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import store from "./store/store";

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
      <p className="mt-4 text-gray-600">Loading...</p>
    </div>
  </div>
);

import MainLayout from "./components/Layout/MainLayout";
import { PlaceholderPage } from "./pages/PlaceholderPage";
import { TrimesterPage } from "./pages/pregnancyTrimester/trimesterPage";
import { TrimesterAddEdit } from "./pages/pregnancyTrimester/trimesterAddEdit";
import { NutritionPlanPage } from "./pages/nutritions/nutritionPlanPage";
import { NutritionPlanAddEdit } from "./pages/nutritions/nutritionPlanAddEdit";
import { MealPlanPage } from "./pages/mealPlans/mealPlanPage";
import { MealPlanAddEdit } from "./pages/mealPlans/mealPlanAddEdit";
/* ===================== AUTH & DASHBOARD ===================== */
const Login = lazy(() =>
  import("./pages/Login").then((m) => ({ default: m.Login })),
);
const Profile = lazy(() =>
  import("./pages/Profile").then((m) => ({ default: m.Profile })),
);
const Dashboard = lazy(() =>
  import("./pages/Dashboard").then((m) => ({ default: m.AdminDashboard })),
);
/* ===================== TIPS ===================== */
const TipsPage = lazy(() =>
  import("./pages/tips/tipsPage").then((m) => ({ default: m.TipsPage })),
);
const TipsAddEdit = lazy(() =>
  import("./pages/tips/tipsAddEdit").then((m) => ({
    default: m.TipsAddEdit,
  })),
);
/* ===================== USERS ===================== */
const UserPage = lazy(() =>
  import("./pages/users/userPage").then((m) => ({ default: m.UserPage })),
);
const UserAddEdit = lazy(() =>
  import("./pages/users/userAddEdit").then((m) => ({
    default: m.UserAddEdit,
  })),
);
/* ===================== EXPERTS ===================== */
const ExpertPage = lazy(() =>
  import("./pages/experts/expertPage").then((m) => ({
    default: m.ExpertPage,
  })),
);
const ExpertAddEdit = lazy(() =>
  import("./pages/experts/expertAddEdit").then((m) => ({
    default: m.ExpertAddEdit,
  })),
);
/* ===================== PRENATAL SERVICES ===================== */
const PrenatalServicesPage = lazy(() =>
  import("./pages/prenatalServices/prenatalServicePage").then((m) => ({
    default: m.PrenatalServicesPage,
  })),
);
const PrenatalServicesAddEdit = lazy(() =>
  import("./pages/prenatalServices/prenatalServiceAddEdit").then((m) => ({
    default: m.PrenatalServicesAddEdit,
  })),
);
/* ===================== CATEGORY ===================== */
const CategoryPage = lazy(() =>
  import("./pages/category/categoryPage").then((m) => ({
    default: m.CategoryPage,
  })),
);
const CategoryAddEdit = lazy(() =>
  import("./pages/category/CategoryAddEdit").then((m) => ({
    default: m.CategoryAddEdit,
  })),
);

/* ===================== GALLERY ===================== */
const GalleryPage = lazy(() =>
  import("./pages/gallery/GalleryPage").then((m) => ({
    default: m.GalleryPage,
  })),
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <Toaster position="top-right" />
        <Router>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              {/* Protected routes */}
              <Route element={<MainLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/users" element={<UserPage />} />
                <Route path="/users/add" element={<UserAddEdit />} />
                <Route path="/users/update/:id" element={<UserAddEdit />} />
                <Route path="/category" element={<CategoryPage />} />
                <Route path="/category/add" element={<CategoryAddEdit />} />
                <Route
                  path="/category/update/:id"
                  element={<CategoryAddEdit />}
                />
                <Route path="/tips" element={<TipsPage />} />
                <Route path="/tips/add" element={<TipsAddEdit />} />
                <Route path="/tips/update/:id" element={<TipsAddEdit />} />
                <Route path="/experts" element={<ExpertPage />} />
                <Route path="/experts/add" element={<ExpertAddEdit />} />
                <Route path="/experts/update/:id" element={<ExpertAddEdit />} />
                <Route
                  path="/prenatal-cares"
                  element={<PrenatalServicesPage />}
                />
                <Route
                  path="/prenatal-cares/add"
                  element={<PrenatalServicesAddEdit />}
                />
                <Route
                  path="/prenatal-cares/update/:id"
                  element={<PrenatalServicesAddEdit />}
                />
                <Route path="/trimester" element={<TrimesterPage />} />
                <Route path="/trimester/add" element={<TrimesterAddEdit />} />
                <Route
                  path="/trimester/update/:id"
                  element={<TrimesterAddEdit />}
                />
                <Route path="/nutritions" element={<NutritionPlanPage />} />
                <Route
                  path="/nutritions/add"
                  element={<NutritionPlanAddEdit />}
                />
                <Route
                  path="/nutritions/update/:id"
                  element={<NutritionPlanAddEdit />}
                />
                <Route path="/meal-plans" element={<MealPlanPage />} />
                <Route path="/meal-plans/add" element={<MealPlanAddEdit />} />
                <Route
                  path="/meal-plans/update/:id"
                  element={<MealPlanAddEdit />}
                />
                <Route
                  path="/products"
                  element={<PlaceholderPage title="Products" />}
                />
                <Route
                  path="/contact-inquiries"
                  element={<PlaceholderPage title="Contact Inquiries" />}
                />
                <Route
                  path="/wellness-mindfulness"
                  element={<PlaceholderPage title="Wellness & Mindfulness" />}
                />
                <Route
                  path="/privacies"
                  element={<PlaceholderPage title="Privacy & Policies" />}
                />
                <Route
                  path="/terms"
                  element={<PlaceholderPage title="Terms & Conditions" />}
                />
                <Route path="/gallery" element={<GalleryPage />} />
                {/* Default redirect to dashboard */}
                <Route
                  path="/"
                  element={<Navigate to="/dashboard" replace />}
                />
                <Route
                  path="*"
                  element={<Navigate to="/dashboard" replace />}
                />
              </Route>
            </Routes>
          </Suspense>
        </Router>
      </QueryClientProvider>
    </Provider>
  );
};

export default App;
