import adminApi from "./adminApi";

// =====================================================
// PUBLIC
// =====================================================

export const getAllProducts = async (params = {}) => {
  const response = await adminApi.get("/products", {
    params,
  });

  return response.data;
};

export const getProductById = async (productId) => {
  const response = await adminApi.get(`/products/${productId}`);

  return response.data;
};

// =====================================================
// ADMIN
// =====================================================

export const getAllAdminProducts = async (params = {}) => {
  const response = await adminApi.get("/products/admin/all", {
    params,
  });

  return response.data;
};

export const getAdminProductById = async (productId) => {
  const response = await adminApi.get(`/products/${productId}`);

  return response.data;
};

export const createProduct = async (formData) => {
  const response = await adminApi.post("/products", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const updateProduct = async (productId, formData) => {
  const response = await adminApi.patch(`/products/${productId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const toggleProductStatus = async (productId) => {
  const response = await adminApi.patch(`/products/${productId}/status`);

  return response.data;
};

export const deleteProduct = async (productId) => {
  const response = await adminApi.delete(`/products/${productId}`);

  return response.data;
};
