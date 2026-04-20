import axios from "axios";
import api from "./api";

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

apiLanding.interceptors.response.use(
    (response) => response,

    async (error) => {
    const originalRequest = error.config;

    if (
        error.response?.status === 401 &&
        !originalRequest._retry
    ) {
        originalRequest._retry = true;

        const refreshToken =
            localStorage.getItem("refresh_token");

        if (!refreshToken) {
            delete originalRequest.headers.Authorization;
            return api(originalRequest);
        }

        try {
        const response = await axios.post(
            `${url}/token/refresh/`,
            {
                refresh: refreshToken,
            },
        );

        const newAccess = response.data.access;

        // Guardar nuevo access
        localStorage.setItem("access_token", newAccess);

        // Reintentar request original
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;

        return apiLanding(originalRequest);
        } catch {
        delete originalRequest.headers.Authorization;
        return api(originalRequest);
        }
    }

    throw error;
    },
);

export default apiLanding;