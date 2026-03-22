import { useQuery } from "@tanstack/react-query";
import PropiedadRepository from "../repositories/PropiedadRepository";
import FiltrosPropiedades from "../types/FiltrosPropiedad";

export default function useHostPropiedades(
  filters: FiltrosPropiedades = {},
  hostId: number,
) {
  return useQuery({
    queryKey: ["propiedades_host", filters],
    queryFn: () =>PropiedadRepository.findAllByHost(filters, hostId),
    enabled: !!filters,
  });
}
