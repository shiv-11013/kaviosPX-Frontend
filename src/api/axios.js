import axios from "axios";

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "https://kaviospx.onrender.com",
  withCredentials: true,
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      const path = window.location.pathname;
      if (path !== "/" && path !== "/register" && path !== "/verify-otp") {
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

export default instance;