import api from "../../../utils/api";
import { useQuery } from "@tanstack/react-query";

export default function usePromedio(id: number) {
    return  useQuery({
    queryKey: ["promedio", id],
    queryFn: () =>
        api
        .get(`/calificaciones/promedio/?propiedad=${id}`)
        .then((r) => r.data),
  });
}