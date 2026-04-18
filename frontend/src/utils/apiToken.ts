import axios, { AxiosError } from "axios";

const url = import.meta.env.VITE_API_URL;

const apiToken = axios.create({
  baseURL: url,
  timeout: 60000,
});

// instancia separada SOLO para refresh
const apiRefresh = axios.create({
  baseURL: url,
});

let isRefreshing = false;

type FailedRequest = {
  resolve: (token: string) => void;
  reject: (error: any) => void;
};

let failedQueue: FailedRequest[] = [];

function processQueue(
  error: any,
  token: string | null = null,
) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });

  failedQueue = [];
}

apiToken.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

apiToken.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/token/refresh/")
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              if (originalRequest.headers) {
                originalRequest.headers["Authorization"] =
                  `Bearer ${token}`;
              }

              resolve(apiToken(originalRequest));
            },
            reject: (err) => reject(err),
          });
        });
      }

      isRefreshing = true;

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken =
          localStorage.getItem("refresh_token");

        if (!refreshToken) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");

          globalThis.location.href = "/login";

          throw error;
        }

        // 🔹 REFRESH REQUEST
        const response = await apiRefresh.post(
          "/token/refresh/",
          {
            refresh: refreshToken,
          },
        );

        const newAccess = response.data.access;

        localStorage.setItem("access_token", newAccess);

        processQueue(null, newAccess);

        if (originalRequest.headers) {
          originalRequest.headers["Authorization"] =
            `Bearer ${newAccess}`;
        }

        return apiToken(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);

        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        globalThis.location.href = "/login";
        throw refreshError;
      } finally {
        isRefreshing = false;
      }
    }
    throw error;
  },
);

export default apiToken;
