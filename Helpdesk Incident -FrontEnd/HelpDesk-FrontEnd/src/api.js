import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  const isPublicAuth = /\/auth\/(login|register)/.test(config.url || "");
  if (token && !isPublicAuth) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isPublicAuth = /\/auth\/(login|register)/.test(error.config?.url || "");
    if (error.response?.status === 401 && !isPublicAuth) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.assign("/login?expired=1");
    }
    return Promise.reject(error);
  },
);

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

export function errorText(error) {
  const { status, data } = error.response || {};
  if (status === 403) return "You do not have permission to do this.";
  if (status === 404) return "This item was not found or you do not have access to it.";
  if (status >= 500) return "The server had a problem. Please try again.";
  if (error.code === "ERR_NETWORK") return "Could not reach the helpdesk server. Check that it is running and try again.";
  return data?.message || error.message || "Could not reach the server. Check that the backend is running.";
}

export default api;
