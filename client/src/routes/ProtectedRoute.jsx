// =====================================================
// CUSTOMER PROTECTED ROUTE
// =====================================================

import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function ProtectedRoute() {
  const { user, loading } = useAuth();

  const location = useLocation();

  // =====================================================
  // CHECKING CUSTOMER SESSION
  // =====================================================

  if (loading) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />

          <p className="mt-3 text-sm text-text-secondary">
            Checking your session...
          </p>
        </div>
      </main>
    );
  }

  // =====================================================
  // CUSTOMER NOT AUTHENTICATED
  // =====================================================

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // =====================================================
  // CUSTOMER AUTHENTICATED
  // =====================================================

  return <Outlet />;
}

export default ProtectedRoute;
