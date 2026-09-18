import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuthStore from "../store/authStore.js";

// <ProtectedRoute />                      -> any logged-in user
// <ProtectedRoute roles={["donor"]} />    -> only users with one of these roles
export default function ProtectedRoute({ roles }) {
  // Selecting each field separately means this component only re-renders
  // when these specific values change — not on every user/token update.
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const loading = useAuthStore((state) => state.loading);
  const role = useAuthStore((state) => state.user?.role);
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Users created before roles existed have no `role` -> treat them as donors
  if (roles && !roles.includes(role ?? "donor")) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
}
