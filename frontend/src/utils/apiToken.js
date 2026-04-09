import axios from "axios";

const url = import.meta.env.VITE_API_URL;

const apiToken = axios.create({
    baseURL: url,
    timeout: 5000,
});


apiToken.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(`access_token`);
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
)

apiToken.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalReq = error.config;
        if (error.response && error.response?.status == 401 && !originalReq._retry && !originalReq.url.includes("/token/refresh/")) {
            originalReq._retry = true;
            try {
                const refreshToken = localStorage.getItem('refresh_token');
                if (!refreshToken) {
                    globalThis.location.href = "/login";
                    return new Error(error);
                }
                const res = await axios.post(`${url}/token/refresh/`, {
                    refresh: refreshToken
                });
                localStorage.setItem('access_token', res.data.access);
                originalReq.headers['Authorization'] = `Bearer ${res.data.access}`;
                return apiToken(originalReq);
            } catch (refreshError) {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                globalThis.location.href = '/login';
                return new Error(refreshError);
            }
        }
        throw new Error(error);
    }
)

export default apiToken;