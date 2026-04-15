import axios from "axios";

const url = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: url,
  timeout: 5000,
});

// Adjunta el JWT a cada request si existe
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
