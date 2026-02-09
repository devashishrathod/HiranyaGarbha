import React, { useEffect } from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import Header from "./Header";
import Sidebar from "./Sidebar";
import useAuth from "../../hooks/useAuth";
import { getUserProfile } from "../../store/auth/authActions";

class RouteErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error(error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded border border-red-200 bg-red-50 p-4">
          <h3 className="font-bold text-red-600">Something went wrong</h3>
          <p className="mt-1 text-sm text-red-700">Please reload the page.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

const MainLayout = () => {
  const { isAuthenticated, user } = useAuth();
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    // Refresh user profile on layout mount
    if (isAuthenticated && !user) {
      dispatch(getUserProfile());
    }
  }, [dispatch, isAuthenticated, user]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Sidebar - Fixed position */}
      <Sidebar />

      {/* Main content area - Scrollable */}
      <div className="flex flex-col flex-1 lg:ml-72 overflow-hidden">
        {/* Header - Fixed position */}
        <Header />

        {/* Main content - Scrollable */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <RouteErrorBoundary key={location.pathname}>
            <Outlet />
          </RouteErrorBoundary>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
