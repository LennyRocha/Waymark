import { useQuery } from "@tanstack/react-query";
import PropiedadRepository from "../repositories/PropiedadRepository";
import FiltrosPropiedades from "../types/FiltrosPropiedad";

export default function useHostPropiedades(
  filters: FiltrosPropiedades,
) {
  return useQuery({
    queryKey: ["propiedades_host", filters],
    queryFn: () =>PropiedadRepository.findAllByHost(filters),
    enabled: !!filters,
  });
}
