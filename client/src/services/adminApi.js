// =====================================================
// ADMIN API SERVICE
// =====================================================

import axios from "axios";

const adminApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// =====================================================
// REQUEST INTERCEPTOR
// =====================================================

adminApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("arfusion_admin_token");

    if (token) {
      config.headers = config.headers || {};

      config.headers.Authorization = `Bearer ${token}`;
    }

    // Let Axios/browser set multipart boundary
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
      delete config.headers["content-type"];
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// =====================================================
// RESPONSE INTERCEPTOR
// =====================================================

adminApi.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.response?.status === 401) {
      console.warn("Admin authentication expired or invalid.");

      localStorage.removeItem("arfusion_admin_token");

      localStorage.removeItem("arfusion_admin_user");
    }

    if (error.response?.status === 403) {
      console.warn("Admin access denied.");
    }

    return Promise.reject(error);
  },
);

export default adminApi;
