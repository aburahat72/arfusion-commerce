import adminApi from "./adminApi";

// =====================================================
// PUBLIC PRODUCTS
// =====================================================

/**
 * Get all active products
 *
 * GET /api/products
 *
 * Supports:
 * ?search=
 * ?category=
 * ?minPrice=
 * ?maxPrice=
 * ?page=
 * ?limit=
 */
export const getAllProducts = async (params = {}) => {
  const response = await adminApi.get("/products", {
    params,
  });

  return response.data;
};

/**
 * Get one active product
 *
 * GET /api/products/:id
 */
export const getProductById = async (productId) => {
  const response = await adminApi.get(`/products/${productId}`);

  return response.data;
};

// =====================================================
// ADMIN PRODUCTS
// =====================================================

/**
 * Get all products for admin
 *
 * GET /api/products/admin/all
 *
 * Supports:
 * ?search=
 * ?category=
 * ?stock=
 * ?page=
 * ?limit=
 */
export const getAllAdminProducts = async (params = {}) => {
  const response = await adminApi.get("/products/admin/all", {
    params,
  });

  return response.data;
};

/**
 * Get one product for admin
 *
 * GET /api/products/admin/:id
 */
export const getAdminProductById = async (productId) => {
  const response = await adminApi.get(`/products/admin/${productId}`);

  return response.data;
};

// =====================================================
// CREATE PRODUCT
// =====================================================

/**
 * Create product
 *
 * POST /api/products
 *
 * Content-Type:
 * multipart/form-data
 */
export const createProduct = async (formData) => {
  const response = await adminApi.post("/products", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

// =====================================================
// UPDATE PRODUCT
// =====================================================

/**
 * Update product
 *
 * PUT /api/products/:id
 *
 * Content-Type:
 * multipart/form-data
 */
export const updateProduct = async (productId, formData) => {
  const response = await adminApi.put(`/products/${productId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

// =====================================================
// TOGGLE PRODUCT STATUS
// =====================================================

/**
 * Enable / disable product
 *
 * PATCH /api/products/:id/status
 */
export const toggleProductStatus = async (productId) => {
  const response = await adminApi.patch(`/products/${productId}/status`);

  return response.data;
};

// =====================================================
// DELETE PRODUCT
// =====================================================

/**
 * Delete product
 *
 * DELETE /api/products/:id
 */
export const deleteProduct = async (productId) => {
  const response = await adminApi.delete(`/products/${productId}`);

  return response.data;
};
