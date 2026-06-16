import axios from "axios";

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "https://kaviospx.onrender.com",
  withCredentials: true,
});

// Attach JWT to every request
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global response handler — redirect to login on 401
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      // Avoid redirect loop if already on auth pages
      const path = window.location.pathname;
      if (path !== "/" && path !== "/register" && path !== "/verify-otp") {
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

export default instance;