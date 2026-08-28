// =====================================================
// ADMIN API SERVICE
// =====================================================

import axios from "axios";

// =====================================================
// ADMIN API INSTANCE
// =====================================================

const adminApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// =====================================================
// ADMIN AUTHENTICATION TOKEN
// =====================================================
//
// IMPORTANT:
// This must match AdminAuthContext.jsx
//
// Admin token:
// arfusion_admin_token
//
// Customer token:
// arfusion_token
//
// Admin and customer authentication are kept separate.
// =====================================================

adminApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("arfusion_admin_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// =====================================================
// ADMIN API RESPONSE HANDLER
// =====================================================

adminApi.interceptors.response.use(
  (response) => {
    return response;
  },

  (error) => {
    // ===================================================
    // ADMIN SESSION EXPIRED / INVALID
    // ===================================================

    if (error.response?.status === 401) {
      console.warn("Admin authentication expired or invalid.");

      localStorage.removeItem("arfusion_admin_token");
      localStorage.removeItem("arfusion_admin_user");
    }

    // ===================================================
    // ADMIN ACCESS DENIED
    // ===================================================

    if (error.response?.status === 403) {
      console.warn("Admin access denied.");
    }

    return Promise.reject(error);
  },
);

// =====================================================
// EXPORT ADMIN API
// =====================================================

export default adminApi;
