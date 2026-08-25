import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT to protected requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("arfusion_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Clear authentication data when the token is invalid
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("arfusion_token");
      localStorage.removeItem("arfusion_user");
    }

    return Promise.reject(error);
  },
);

export default api;
