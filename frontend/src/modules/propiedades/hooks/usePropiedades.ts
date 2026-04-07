import { useQuery } from "@tanstack/react-query";
import PropiedadRepository from "../repositories/PropiedadRepository";
import FiltrosPropiedades from "../types/FiltrosPropiedad";

export default function usePropiedades(filters: FiltrosPropiedades = {}) {
  return useQuery({
    queryKey: ["propiedades", filters],
    queryFn: () => PropiedadRepository.findAll(filters),
  });
}