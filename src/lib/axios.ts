import axios from "axios";

let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  localStorage.setItem("accessToken", token || "");
};

export const getAccessToken = () => {
  const token = localStorage.getItem("accessToken");
  return token;
};

const apiClient = axios.create({
  baseURL: "", // Your API base URL
});

// Request Interceptor: Adds the access token to every outgoing request
apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handles 401 errors by refreshing the token
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 and we haven't retried yet
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { data } = await axios.post("/api/auth/refresh-token");
        setAccessToken(data.accessToken);

        // Update the header and retry the original request
        originalRequest.headers["Authorization"] = `Bearer ${data.accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh token failed, logout the user
        setAccessToken(null);
        // Redirect to login page
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
