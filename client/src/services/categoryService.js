// =====================================================
// CATEGORY SERVICE
// =====================================================

import adminApi from "./adminApi";

// =====================================================
// GET ALL CATEGORIES
// ADMIN
// =====================================================

export const getAllCategories = async () => {
  const response = await adminApi.get("/categories/admin/all");

  return response.data;
};

// =====================================================
// GET ACTIVE CATEGORIES
// PUBLIC
// =====================================================

export const getActiveCategories = async () => {
  const response = await adminApi.get("/categories");

  return response.data;
};

// =====================================================
// CREATE CATEGORY
// ADMIN
// multipart/form-data
// =====================================================

export const createCategory = async (formData) => {
  const response = await adminApi.post("/categories", formData);

  return response.data;
};

// =====================================================
// UPDATE CATEGORY
// ADMIN
// multipart/form-data
// =====================================================

export const updateCategory = async (categoryId, formData) => {
  const response = await adminApi.put(`/categories/${categoryId}`, formData);

  return response.data;
};

// =====================================================
// ENABLE / DISABLE CATEGORY
// ADMIN
// =====================================================

export const toggleCategoryStatus = async (categoryId) => {
  const response = await adminApi.patch(`/categories/${categoryId}/status`);

  return response.data;
};

// =====================================================
// DELETE CATEGORY
// ADMIN
// =====================================================

export const deleteCategory = async (categoryId) => {
  const response = await adminApi.delete(`/categories/${categoryId}`);

  return response.data;
};
