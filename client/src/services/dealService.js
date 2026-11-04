// =====================================================
// DEAL OF THE DAY — PUBLIC SERVICE
// =====================================================
// Used by the public homepage. No auth required.

import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const publicApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Get the currently active, non-expired deal
export const getActiveDeal = async () => {
  const response = await publicApi.get("/deals/active");

  if (!response.data?.success) {
    throw new Error(response.data?.message || "Failed to fetch deal");
  }

  return response.data?.deal || null;
};
