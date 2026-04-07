import {
  useQuery,
} from "@tanstack/react-query";
import PropiedadRepository from "../repositories/PropiedadRepository";

export default function useUbicaciones() {
  return useQuery({
    queryKey: ["ubicaciones"],
    queryFn: PropiedadRepository.findUbicaciones,
  });
}