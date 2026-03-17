import axios from "axios";

const url = import.meta.env.API_URL;

const api = axios.create({
  baseURL: url,
  timeout: 5000,
});

export default api;