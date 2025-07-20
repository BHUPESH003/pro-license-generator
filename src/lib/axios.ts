import axios from "axios";
import { store } from "../store/store";

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Correctly create the custom instance with all its configurations
const api = axios.create({
  baseURL,
  withCredentials: true, // ✅ Set credentials config here
});

// Request interceptor to add auth token from Redux store
api.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.auth?.token;
    if (token) {
      // Ensure headers object exists before assigning
      config.headers = config.headers || {};
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle global 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if it's a 401 Unauthorized error
    if (error.response && error.response.status === 401) {
      // Ensure this code runs only on the client-side
      if (typeof window !== "undefined") {
        // Redirect to login page for re-authentication
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
