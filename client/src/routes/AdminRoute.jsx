import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function AdminRoute() {
  const { user, loading } = useAuth();

  const location = useLocation();

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

  // Not authenticated → Admin Login
  if (!user) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  // Authenticated but not an admin → Customer home
  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default AdminRoute;
