// =====================================================
// CUSTOMER API
// =====================================================

import axios from "axios";

// =====================================================
// CUSTOMER API INSTANCE
// =====================================================

const customerApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// =====================================================
// ATTACH CUSTOMER JWT TO PROTECTED REQUESTS
// =====================================================

customerApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("arfusion_token");

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
// CUSTOMER AUTH ERROR HANDLER
// =====================================================

customerApi.interceptors.response.use(
  (response) => {
    return response;
  },

  (error) => {
    // ===================================================
    // CUSTOMER SESSION EXPIRED / INVALID
    // ===================================================

    if (error.response?.status === 401) {
      console.warn("Customer authentication expired or invalid.");

      localStorage.removeItem("arfusion_token");
      localStorage.removeItem("arfusion_user");
    }

    return Promise.reject(error);
  },
);

// =====================================================
// EXPORT CUSTOMER API
// =====================================================

export default customerApi;
