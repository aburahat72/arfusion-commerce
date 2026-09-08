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

    // Let browser set multipart boundary
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
      delete config.headers["content-type"];
    }

    return config;
  },
  (error) => Promise.reject(error),
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

// =====================================================
// CUSTOMER MANAGEMENT
// =====================================================

export const getCustomers = () => {
  return adminApi.get("/admin/customers");
};

export const getCustomerById = (id) => {
  return adminApi.get(`/admin/customers/${id}`);
};

export const updateCustomerStatus = (id, isActive) => {
  return adminApi.patch(`/admin/customers/${id}/status`, {
    isActive,
  });
};

export const updateCustomer = (id, data) => {
  return adminApi.patch(`/admin/customers/${id}`, data);
};

export const deleteCustomer = (id) => {
  return adminApi.delete(`/admin/customers/${id}`);
};

// =====================================================
// ORDERS
// =====================================================

// Get all real orders
export const getAdminOrders = (params = {}) => {
  return adminApi.get("/orders", {
    params,
  });
};

// Get one real order
export const getAdminOrderById = (orderId) => {
  return adminApi.get(`/orders/admin/${orderId}`);
};

// Update order stage
export const updateAdminOrderStatus = (orderId, orderStatus) => {
  return adminApi.patch(`/orders/${orderId}/status`, {
    orderStatus,
  });
};

// =====================================================
// RETURNS
// =====================================================

// Get all return requests
export const getAdminReturnRequests = () => {
  return adminApi.get("/returns");
};

// Approve return
export const approveReturn = (orderId) => {
  return adminApi.put(`/returns/${orderId}/approve`);
};

// Reject return
export const rejectReturn = (orderId) => {
  return adminApi.put(`/returns/${orderId}/reject`);
};

// Complete refund
export const completeRefund = (orderId) => {
  return adminApi.put(`/returns/${orderId}/complete-refund`);
};

// Complete replacement
export const completeReplacement = (orderId) => {
  return adminApi.put(`/returns/${orderId}/complete-replacement`);
};

// =====================================================
// DEFAULT EXPORT
// =====================================================

export default adminApi;
