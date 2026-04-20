import axios from "axios";

const url = import.meta.env.VITE_API_URL;

const apiLanding = axios.create({
    baseURL: url,
    timeout: 60000,
});

apiLanding.interceptors.request.use((config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default apiLanding;