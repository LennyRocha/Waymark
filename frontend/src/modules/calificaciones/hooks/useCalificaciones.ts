import api from "../../../utils/api";
import { useQuery } from "@tanstack/react-query";

export default function useCalificaciones(id: number) {
  return useQuery({
    queryKey: ["calificaciones", id],
    queryFn: () =>
      api
        .get(`/calificaciones/?propiedad=${id}`)
        .then((r) => r.data),
  });
}
