import axios from "axios";

// =====================================================
// PUBLIC BANNER API
// =====================================================
//
// This service is intentionally separate from admin
// bannerService.js.
//
// The homepage is public, so it must NOT depend on
// admin authentication.
//
// Backend endpoint:
//
// GET /api/banners
//
// Returns active banners sorted by sortOrder.
//
// =====================================================

// =====================================================
// API BASE URL
// =====================================================

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// =====================================================
// PUBLIC AXIOS CLIENT
// =====================================================

const publicApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// =====================================================
// GET ACTIVE BANNERS
// =====================================================

export const getPublicBanners = async () => {
  const response = await publicApi.get("/banners");

  if (!response.data?.success) {
    throw new Error(response.data?.message || "Failed to fetch banners");
  }

  return Array.isArray(response.data?.banners) ? response.data.banners : [];
};

export default publicApi;
