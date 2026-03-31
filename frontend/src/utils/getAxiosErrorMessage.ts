import axios from "axios";

const mensajes: Record<number, string> = {
  400: "Petición incorrecta",
  401: "No autorizado / sesión expirada",
  403: "Acceso denegado",
  404: "Recurso no encontrado",
  409: "Conflicto con el estado actual del recurso",
  500: "Error interno del servidor",
  502: "Error de puerta de enlace",
  503: "Servicio no disponible",
  504: "Tiempo de espera agotado",
};

export function getAxiosErrorMessage(error: unknown) {
  if (!axios.isAxiosError(error)) {
    return (error as any)?.message || "Error desconocido";
  }

  // 1️⃣ Timeout
  if (error.code === "ECONNABORTED") {
    return "Se agotó el tiempo de espera para realizar la solicitud";
  }

  // 2️⃣ Error de conexión / sin red
  if (
    error.message?.toLowerCase().includes("network error")
  ) {
    return "Error de conexión, revisa tu conexión a internet y vuelve a intentarlo";
  }

  // 3️⃣ Error con respuesta del servidor
  const status = error.response?.status;
  const message = error.response?.data?.message;

  if (error.response) {
    return (
      message ||
      mensajes[status ?? 500] ||
      `Error del servidor (código ${status})`
    );
  }

  // 4️⃣ Petición enviada pero sin respuesta
  if (error.request) {
    return "No se recibió respuesta del servidor";
  }

  // 5️⃣ Cualquier otro error desconocido
  return error.message || "Error desconocido";
}
