// =====================================================
// ADMIN ROUTE GUARD
// =====================================================

import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAdminAuth } from "../context/AdminAuthContext";

// =====================================================
// ADMIN PROTECTED ROUTE
// =====================================================

function AdminRoute() {
  const { user, loading } = useAdminAuth();

  const location = useLocation();

  // =====================================================
  // CHECKING ADMIN SESSION
  // =====================================================

  if (loading) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />

          <p className="mt-3 text-sm text-text-secondary">
            Checking admin session...
          </p>
        </div>
      </main>
    );
  }

  // =====================================================
  // ADMIN NOT AUTHENTICATED
  // =====================================================

  if (!user) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  // =====================================================
  // ADMIN ROLE CHECK
  // =====================================================

  if (user.role !== "admin") {
    return <Navigate to="/admin/login" replace />;
  }

  // =====================================================
  // ADMIN AUTHENTICATED
  // =====================================================

  return <Outlet />;
}

export default AdminRoute;
