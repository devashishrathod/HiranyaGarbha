import React, { useEffect } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import Header from "./Header";
import Sidebar from "./Sidebar";
import useAuth from "../../hooks/useAuth";
import { getUserProfile } from "../../store/auth/authActions";

const MainLayout = () => {
  const { isAuthenticated, user } = useAuth();
  const dispatch = useDispatch();

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
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
