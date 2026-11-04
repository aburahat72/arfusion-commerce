// =====================================================
// DEAL OF THE DAY — ADMIN SERVICE
// =====================================================

import adminApi from "./adminApi";

// Get all deals
export const getAllDeals = async () => {
  const response = await adminApi.get("/deals");

  if (!response.data?.success) {
    throw new Error(response.data?.message || "Failed to fetch deals");
  }

  return response.data?.deals || [];
};

// Get single deal by ID
export const getDealById = async (id) => {
  if (!id) throw new Error("Deal ID is required");

  const response = await adminApi.get(`/deals/${encodeURIComponent(id)}`);

  if (!response.data?.success) {
    throw new Error(response.data?.message || "Failed to fetch deal");
  }

  return response.data?.deal;
};

// Create a new deal
export const createDeal = async (data) => {
  const response = await adminApi.post("/deals", data);

  if (!response.data?.success) {
    throw new Error(response.data?.message || "Failed to create deal");
  }

  return response.data?.deal;
};

// Update deal
export const updateDeal = async (id, data) => {
  if (!id) throw new Error("Deal ID is required");

  const response = await adminApi.patch(`/deals/${encodeURIComponent(id)}`, data);

  if (!response.data?.success) {
    throw new Error(response.data?.message || "Failed to update deal");
  }

  return response.data?.deal;
};

// Toggle deal active/inactive
export const toggleDealStatus = async (id) => {
  if (!id) throw new Error("Deal ID is required");

  const response = await adminApi.patch(
    `/deals/${encodeURIComponent(id)}/status`,
  );

  if (!response.data?.success) {
    throw new Error(response.data?.message || "Failed to toggle deal status");
  }

  return response.data?.deal;
};

// Delete deal
export const deleteDeal = async (id) => {
  if (!id) throw new Error("Deal ID is required");

  const response = await adminApi.delete(`/deals/${encodeURIComponent(id)}`);

  if (!response.data?.success) {
    throw new Error(response.data?.message || "Failed to delete deal");
  }

  return response.data;
};
