import axios from "axios";
import adminApi from "./adminApi";

const publicApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

export const getPublicHomepageStatistics = async () => {
  const response = await publicApi.get("/homepage-statistics");

  if (!response.data?.success || !response.data?.statistics) {
    throw new Error(
      response.data?.message || "Failed to fetch homepage statistics.",
    );
  }

  return response.data.statistics;
};

export const getAdminHomepageStatistics = async () => {
  const response = await adminApi.get("/homepage-statistics/admin");

  if (!response.data?.success || !response.data?.settings) {
    throw new Error(
      response.data?.message || "Failed to fetch homepage statistics settings.",
    );
  }

  return response.data;
};

export const updateAdminHomepageStatistics = async (statistics) => {
  const response = await adminApi.patch(
    "/homepage-statistics/admin",
    statistics,
  );

  if (!response.data?.success || !response.data?.settings) {
    throw new Error(
      response.data?.message || "Failed to update homepage statistics.",
    );
  }

  return response.data;
};
