import { useQuery } from "@tanstack/react-query";
import PropiedadRepository from "../repositories/PropiedadRepository";

export default function usePropiedad(id: number) {
  return useQuery({
    queryKey: ["propiedad", id],
    queryFn: () => PropiedadRepository.findOne(id),
  });
}