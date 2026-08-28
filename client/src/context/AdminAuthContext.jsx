// =====================================================
// ADMIN AUTH CONTEXT
// =====================================================

import { createContext, useContext, useEffect, useState } from "react";

import adminApi from "../services/adminApi";

const AdminAuthContext = createContext(null);

// =====================================================
// ADMIN STORAGE KEYS
// =====================================================

const ADMIN_TOKEN_KEY = "arfusion_admin_token";
const ADMIN_USER_KEY = "arfusion_admin_user";

// =====================================================
// CLEAR ADMIN SESSION
// =====================================================
// IMPORTANT:
// This function ONLY removes admin authentication.
//
// It does NOT remove:
// - arfusion_token
// - arfusion_user
// - customer authentication
// =====================================================

const clearAdminSession = () => {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(ADMIN_USER_KEY);
};

// =====================================================
// GET STORED ADMIN USER
// =====================================================

const getStoredAdminUser = () => {
  try {
    const savedUser = localStorage.getItem(ADMIN_USER_KEY);

    if (!savedUser) {
      return null;
    }

    const parsedUser = JSON.parse(savedUser);

    // Only an admin can be restored
    if (parsedUser?.role !== "admin") {
      clearAdminSession();
      return null;
    }

    return parsedUser;
  } catch (error) {
    console.error("Failed to restore admin user:", error);

    clearAdminSession();

    return null;
  }
};

// =====================================================
// ADMIN AUTH PROVIDER
// =====================================================

export function AdminAuthProvider({ children }) {
  // ===================================================
  // INITIAL ADMIN USER
  // ===================================================

  const [user, setUser] = useState(getStoredAdminUser);

  // ===================================================
  // ADMIN SESSION LOADING
  // ===================================================

  const [loading, setLoading] = useState(true);

  // =====================================================
  // RESTORE ADMIN SESSION
  // =====================================================

  useEffect(() => {
    let mounted = true;

    const restoreAdminSession = async () => {
      // =================================================
      // GET ADMIN TOKEN
      // =================================================

      const token = localStorage.getItem(ADMIN_TOKEN_KEY);

      // =================================================
      // NO ADMIN TOKEN
      // =================================================

      if (!token) {
        if (mounted) {
          setUser(null);
          setLoading(false);
        }

        return;
      }

      try {
        // =================================================
        // VERIFY ADMIN TOKEN WITH BACKEND
        // =================================================

        const response = await adminApi.get("/auth/admin/profile");

        const adminUser = response.data?.user;

        // =================================================
        // VALID ADMIN SESSION
        // =================================================

        if (response.data?.success && adminUser && adminUser.role === "admin") {
          // Save latest admin profile
          localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(adminUser));

          if (mounted) {
            setUser(adminUser);
          }
        } else {
          // =================================================
          // INVALID ADMIN SESSION
          // =================================================

          clearAdminSession();

          if (mounted) {
            setUser(null);
          }
        }
      } catch (error) {
        console.error("Admin session restoration failed:", error);

        // =================================================
        // INVALID / EXPIRED ADMIN SESSION
        // =================================================

        clearAdminSession();

        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    restoreAdminSession();

    // ===================================================
    // CLEANUP
    // ===================================================

    return () => {
      mounted = false;
    };
  }, []);

  // =====================================================
  // ADMIN LOGIN
  // =====================================================

  const loginAdmin = (token, authenticatedUser) => {
    // =================================================
    // VALIDATE TOKEN
    // =================================================

    if (!token) {
      throw new Error("Admin authentication token is missing.");
    }

    // =================================================
    // VALIDATE ADMIN USER
    // =================================================

    if (authenticatedUser?.role !== "admin") {
      throw new Error("Only admin accounts can use admin authentication.");
    }

    // =================================================
    // SAVE ADMIN TOKEN
    // =================================================

    localStorage.setItem(ADMIN_TOKEN_KEY, token);

    // =================================================
    // SAVE ADMIN USER
    // =================================================

    localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(authenticatedUser));

    // =================================================
    // UPDATE ADMIN STATE
    // =================================================

    setUser(authenticatedUser);
  };

  // =====================================================
  // ADMIN LOGOUT
  // =====================================================

  const logoutAdmin = () => {
    // =================================================
    // CLEAR ONLY ADMIN AUTHENTICATION
    // =================================================

    clearAdminSession();

    // =================================================
    // CLEAR ADMIN REACT STATE
    // =================================================

    setUser(null);
  };

  // =====================================================
  // ADMIN CONTEXT
  // =====================================================

  return (
    <AdminAuthContext.Provider
      value={{
        // Current admin user
        user,

        // Session restoration state
        loading,

        // Authentication status
        isAuthenticated: Boolean(user && user.role === "admin"),

        // Admin login
        loginAdmin,

        // Admin logout
        logoutAdmin,

        // Allow controlled admin state updates
        setUser,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

// =====================================================
// USE ADMIN AUTH
// =====================================================

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);

  if (!context) {
    throw new Error("useAdminAuth must be used inside AdminAuthProvider.");
  }

  return context;
}
