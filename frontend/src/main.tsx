import { StrictMode } from "react";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import toast from "react-hot-toast";
import { getAxiosErrorMessage } from "./utils/getAxiosErrorMessage";
import "react-calendar/dist/Calendar.css";
import { AuthProvider } from "./context/AuthContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnReconnect: true,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      retryDelay: (attempt) =>
        Math.min(1000 * 2 ** attempt, 5000),
      staleTime: 1000 * 60 * 5, // 5 min
      cacheTime: 1000 * 60 * 10, // 10 min
      onError: (error) => {
        toast.error(
          getAxiosErrorMessage(error) ||
            "Ocurrió un error al cargar los datos. Por favor, intenta de nuevo.",
          { duration: 5000 },
        );
      },
    },
    mutations: {
      retry: false,
    },
  },
});

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(
  <StrictMode>
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </AuthProvider>
  </StrictMode>,
);
