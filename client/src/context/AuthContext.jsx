// =====================================================
// IMPORTS
// =====================================================

import { createContext, useContext, useEffect, useState } from "react";

import customerApi from "../services/customerApi";

import {
  getCurrentUser,
  getToken,
  saveAuth,
  logoutUser,
  updateUser,
} from "../utils/authStorage";

// =====================================================
// AUTH CONTEXT
// =====================================================

const AuthContext = createContext(null);

// =====================================================
// AUTH PROVIDER
// =====================================================

export function AuthProvider({ children }) {
  // Current logged-in customer
  const [user, setUser] = useState(getCurrentUser());

  // Session restoration loading state
  const [loading, setLoading] = useState(true);

  // =====================================================
  // RESTORE CUSTOMER SESSION
  // =====================================================

  useEffect(() => {
    const restoreSession = async () => {
      // Get saved customer token
      const token = getToken();

      // No token means customer is not authenticated
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        // Verify customer token and get customer profile
        const response = await customerApi.get("/auth/customer/profile");

        // Customer session is valid
        if (response.data?.success && response.data?.user) {
          // Update stored customer information
          updateUser(response.data.user);

          // Update React state
          setUser(response.data.user);
        } else {
          // Invalid customer session
          logoutUser();
          setUser(null);
        }
      } catch (error) {
        console.error("Customer session restoration failed:", error);

        // Remove invalid/expired customer session
        logoutUser();
        setUser(null);
      } finally {
        // Session restoration completed
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  // =====================================================
  // CUSTOMER LOGIN
  // =====================================================

  const login = (token, authenticatedUser) => {
    // Save customer token and customer data
    saveAuth(token, authenticatedUser);

    // Update React authentication state
    setUser(authenticatedUser);
  };

  // =====================================================
  // CUSTOMER LOGOUT
  // =====================================================

  const logout = () => {
    // Remove customer authentication data
    logoutUser();

    // Clear current customer
    setUser(null);
  };

  // =====================================================
  // AUTH CONTEXT PROVIDER
  // =====================================================

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,

        // Check whether customer is logged in
        isAuthenticated: Boolean(user),

        // Authentication functions
        login,
        logout,

        // Update customer state
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// =====================================================
// USE AUTH HOOK
// =====================================================

export function useAuth() {
  return useContext(AuthContext);
}
