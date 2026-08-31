// =====================================================
// BANNER API SERVICE
// =====================================================

import adminApi from "./adminApi";

// =====================================================
// GET ALL BANNERS — ADMIN
// =====================================================

export const getAdminBanners = async () => {
  const response = await adminApi.get("/banners/admin/all");

  // Check API response
  if (!response.data?.success) {
    throw new Error(response.data?.message || "Failed to fetch banners");
  }

  // Return banners array
  return response.data?.banners || [];
};

// =====================================================
// GET SINGLE BANNER — ADMIN
// =====================================================

export const getAdminBannerById = async (id) => {
  // Validate banner ID
  if (!id) {
    throw new Error("Banner ID is required");
  }

  const response = await adminApi.get(
    `/banners/admin/${encodeURIComponent(id)}`,
  );

  // Check API response
  if (!response.data?.success) {
    throw new Error(response.data?.message || "Failed to fetch banner");
  }

  // Return single banner
  return response.data?.banner;
};

// =====================================================
// CREATE BANNER — ADMIN
// =====================================================

export const createBanner = async (formData) => {
  // Banner creation uses multipart/form-data
  // because images are uploaded to Cloudinary.
  if (!(formData instanceof FormData)) {
    throw new Error("Banner data must be sent as FormData");
  }

  const response = await adminApi.post("/banners", formData);

  // Check API response
  if (!response.data?.success) {
    throw new Error(response.data?.message || "Failed to create banner");
  }

  // Return created banner
  return response.data?.banner;
};

// =====================================================
// UPDATE BANNER — ADMIN
// =====================================================

export const updateBanner = async (id, formData) => {
  // Validate banner ID
  if (!id) {
    throw new Error("Banner ID is required");
  }

  // Update also uses multipart/form-data
  // because images can be replaced.
  if (!(formData instanceof FormData)) {
    throw new Error("Banner data must be sent as FormData");
  }

  const response = await adminApi.patch(
    `/banners/${encodeURIComponent(id)}`,
    formData,
  );

  // Check API response
  if (!response.data?.success) {
    throw new Error(response.data?.message || "Failed to update banner");
  }

  // Return updated banner
  return response.data?.banner;
};

// =====================================================
// DELETE BANNER — ADMIN
// =====================================================

export const deleteBanner = async (id) => {
  // Validate banner ID
  if (!id) {
    throw new Error("Banner ID is required");
  }

  const response = await adminApi.delete(`/banners/${encodeURIComponent(id)}`);

  // Check API response
  if (!response.data?.success) {
    throw new Error(response.data?.message || "Failed to delete banner");
  }

  // Return complete API response
  return response.data;
};

// =====================================================
// TOGGLE ACTIVE / INACTIVE — ADMIN
// =====================================================

export const toggleBannerStatus = async (id) => {
  // Validate banner ID
  if (!id) {
    throw new Error("Banner ID is required");
  }

  const response = await adminApi.patch(
    `/banners/${encodeURIComponent(id)}/status`,
  );

  // Check API response
  if (!response.data?.success) {
    throw new Error(response.data?.message || "Failed to update banner status");
  }

  // Return updated banner
  return response.data?.banner;
};
