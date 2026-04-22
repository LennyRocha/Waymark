import { useQuery } from "@tanstack/react-query";
import PropiedadRepository from "../repositories/PropiedadRepository";

export default function useReservasPropiedad(
  id: number,
) {
  return useQuery({
    queryKey: ["reservas_propiedad", id],
    queryFn: () => PropiedadRepository.getFechas(id),
  });
}
